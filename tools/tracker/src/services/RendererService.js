import {
  patternMuteStates,
  uiFPS,
  bufferSize,
  sampleRate,
  patterns,
  instruments,
  sequence,
  speed,
  selectedRow,
  selectedPattern,
  selectedSequence,
  channelMeters,
  masterVolume,
  currentPlaybackLength,
  songPlaying
} from '../stores.js';

import { getSample, renderNote } from './SampleRendererService.js';

import {
  getCumlativeRowAtPosition,
  getSongLength
} from './SequenceService.js';

import { get } from 'svelte/store';

/**
 * @typedef PositionInfo
 * @property {number} sequence - The sequence position
 * @property {number} pattern - The pattern position
 * @property {number} row - The row index
 */

/**
 * @typedef ChannelInfo
 * @property {number} panning - The stereo panning value of the channel
 * @property {number} attenuation - The current attenutationo f the channel
 * @property {number} sample - The instrument sample data for the channel
 * @property {number} offset - The current position of the sample data
 */

let processor;
let insts;
let patts;
let seq;
let spd;
let playbackSequence;
let targetUpdateFps;
let currentSongPosition;
let pos = 0;
let currentOffset = 0;
let channels = null;
let songLength;
let activeSoundCount = 0;
let currentBufferSize;
let isPlaying = false;
let frames = [];
let mutedTracks;


// Create a gain node for the player volume. This is hooked up to a Svelte store
// so it can be controlled via the user interface.
const gainNode = zzfxX.createGain();
gainNode.connect(zzfxX.destination);


// Stop zzfxX until sounds need to be played. This prevents the render service
// from consuming system resources when not playing sounds.
zzfxX.suspend();


/**
 * Notify the service that a sound is about to be played. If no sounds are
 * currently playing the audio context will be resumed.
 *
 * @returns {Promise} A promise that resolves once the audio can be played.
 */
const registerSound = async () => {
  if (activeSoundCount === 0) {
    await zzfxX.resume();
  }
  activeSoundCount++;
};


/**
 * Notify the service that a sound has finished playing. If no other sounds are
 * currently playing the audio context will be suspended.
 *
 * @returns {Promise} A promise that resolves once the audio has stopped.
 */

const unregisterSound = async () => {
  activeSoundCount--;
  if (activeSoundCount === 0) {
    await zzfxX.suspend();
  }
};


/**
 * Creates a new ScriptProcessor instance using the currently configured service
 * options
 */
const initScriptProcessor = () => {
  channels = null;
  processor = zzfxX.createScriptProcessor(currentBufferSize, 0, 2);
  processor.onaudioprocess = audioCallback;
  processor.connect(gainNode);
};


/**
 * Destroys the current ScriptProcessor.
 */
const killScriptProcessor = () => {
  processor.onaudioprocess = null;
  processor.disconnect(gainNode);
  processor = null;
};


/**
 * Sets the song position based on the current user selection
 */
const setPosition = () => {
  pos = getCumlativeRowAtPosition(get(selectedSequence));
  pos += get(selectedRow);
  currentOffset = 0;
  channels = null;
};


/**
 * Returns the current song position struct information data based on a position
 * index between 0 and total song rows.
 *
 * @param {number} position - the position to retreve data form
 * @returns {PositionInfo} The position information for the song row
 */
const getPositionInfo = (position) => {
  let pos = 0;
  let nextPos = 0;
  for (let sequenceIndex = 0; sequenceIndex < playbackSequence.length; sequenceIndex++) {
    let patternIndex = playbackSequence[sequenceIndex];
    nextPos = pos + patts[patternIndex][0].length - 3;
    if (nextPos >= position) {
      return {
        sequence: sequenceIndex,
        pattern: patternIndex,
        row: position - pos
      };
    }
    pos = nextPos + 1;
  }
  return getPositionInfo(position % (nextPos + 1));
};


/**
 * Updates the current channel state based on the current song position and
 * steps forward one song row.
 *
 * @returns {PositionInfo}
 */
const next = () => {
  pos %= songLength;
  const position = getPositionInfo(pos);
  const { pattern, row } = position;

  if (!channels) {
    channels = [];
  }

  patts[pattern].forEach((channel, i) => {
    const data = channel[row + 2];
    if (data) {
      const [instrument, panning] = channel;
      let note = data | 0;
      let attenuation = data % 1;

      if (note) {
        if (note === -1) {
          channels[i] = null
          return;
        }

        const sample = getSample(instrument, note);

        channels[i] = {
          panning,
          attenuation,
          sample,
          offset: 0
        }
      }

      if (attenuation) {
        if (channels[i]) {
          channels[i].attenuation = attenuation
        }
      }
    }
  });
  pos++;
  return position;
};


/**
 * Mix the sample data of a channel into the output buffers
 *
 * @param {ChannelInfo} channel - the channel
 * @param {number} start - the start position of the sample data
 * @param {number} length - the size of the sample data to copy
 * @param {Array<number>} leftChannelData - Left channel buffer
 * @param {Array<number>} rightChannelData - Right channel buffer
 * @returns {<number>} The peak value for the channel
 */
const mixChannelSampleData = (channel, start, length, leftChannelData, rightChannelData) => {
  let peak = 0;

  if (channel) {
    const { panning, sample } = channel;
    const step = zzfxR / zzfxX.sampleRate;
    const sampleLength = sample.length;
    let { attenuation } = channel;

    for (let i = start; i < start + length; i++) {
      if (channel.offset >= sampleLength) {
        break;
      }
      // If we're approaching the end of the sample, quickly fade it out by
      // increasing the attenuation to prevent clicking.
      if (channel.offset > sampleLength - 99) {
        attenuation += 1 / 99;
      }
      const data = (1 - attenuation) * sample[channel.offset | 0] || 0;
      leftChannelData[i] += -data * panning + data;
      rightChannelData[i] += data * panning + data;
      peak = Math.min(1, Math.max(Math.abs(data), peak));
      channel.offset += step;
    }
  }
  return peak;
};


/**
 * Plays the currently configured pattern sequence.
 */
const play = async () => {
  await registerSound();
  initScriptProcessor();
  songPlaying.set(true);
  isPlaying = true;
  updateUI();
};


/**
 * Updates the Svelte stores with new song data. Listeners will react to these
 * changes, triggering UI updates for the Peak Level meters, pattern row and, if
 * playing the entire song, the currently selected sequence and pattern.
 */
const updateUI = () => {
  if (isPlaying) {
    setTimeout(updateUI, 1000 / targetUpdateFps);
  }
  if (!frames.length) {
    return;
  }
  const { sequence, pattern, row, peakLevels } = frames.shift();

  // If the sequence is the actual song, make the pattern and sequence UI
  // follow along with the current song position.
  if (playbackSequence === seq) {
    selectedSequence.set(sequence);
    selectedPattern.set(pattern);
  }
  selectedRow.set(row);
  channelMeters.set(peakLevels);
};


/**
 * Fills the output buffer with song data
 *
 * @param {AudioProcessingEvent} event - Audio processor event
 */

const audioCallback = event => {
  const { outputBuffer } = event;
  const dataL = outputBuffer.getChannelData(0).fill(0);
  const dataR = outputBuffer.getChannelData(1).fill(0);
  let bufferRemaining = outputBuffer.length;

  let offset = 0;
  frames = [];

  // The length of one song row
  const beatLength = zzfxX.sampleRate / spd * 60 >> 2;

  // The length of sample data we need to process before notifying the UI that
  // something needs to be updated. The UI target frame rate is variable so it
  // can controlled by the end user.
  const frameSize = zzfxX.sampleRate / targetUpdateFps;

  // We we have no channel data from a previous step, get it now.
  if (!channels) {
    currentSongPosition = next();
  }

  // Fill the output buffer with our sample data.
  while (bufferRemaining > 0) {

    // Work out how much data we need to process
    const beatDuration = Math.min(
      bufferRemaining,
      frameSize,
      beatLength - currentOffset
    );

    if (currentOffset >= beatLength) {
      currentSongPosition = next();
      currentOffset -= beatLength;
    }

    // Mix the channel samples into the stereo output buffers
    const peakLevels = channels.map((channel, channelIndex) => {
      if (!mutedTracks[currentSongPosition.pattern][channelIndex]) {
        return mixChannelSampleData(channel, offset, beatDuration, dataL, dataR);
      }
    });

    // If we have a full frame of data, push state data for the UI scheduler to
    // consume later. If we only push a partial frame the UI will render state
    // incorrectly, causing flicker with peak meters.
    if (offset === 0 || beatDuration >= frameSize) {
      frames.push({...currentSongPosition, peakLevels});
    }

    offset += beatDuration;
    currentOffset += beatDuration;
    bufferRemaining -= beatDuration;
  }
};


/**
 * Plays a note with an instrument
 *
 * @param {number} instrument - Index of the instrument to play
 * @param {number} note - Index of the note to play
 * @returns {Promise} A promise that resolves with an AudioBufferSourceNode
 */
export const playNote = (instrument, note) => {
  return playSample(renderNote(instrument, note));
};


/**
 * Plays a ZzFX sound
 *
 * @param {Array<number>} params - ZzFX instrument parameters
 * @returns {Promise} A promise that resolves with an AudioBufferSourceNode
 */
export const playSound = (params) => {
  return playSample(zzfxG(...params));
};


/**
 * Plays sample data
 *
 * @param {Array<Array<number>>} data Audio channel data to play
 * @returns {Promise} A promise that resolves with an AudioBufferSourceNode
 */
export const playSample = async (data) => {
  await registerSound();
  const node = zzfxP([...data]);
  node.onended = unregisterSound;
  return node;
};


/**
 * Plays a pattern.
 *
 * @param {number} pattern - The pattern index to play
 * @param {boolean} fromStart - True to restart, false to resume
 */
export const playPattern = async (pattern, fromStart = false) => {
  if (processor) {
    return false;
  }

  playbackSequence = [pattern];

  if (fromStart) {
    pos = 0;
  } else {
    pos = get(selectedRow);
  }
  await play();
};


/**
 * Plays the current song from it's current position, or optionally from the
 * start
 *
 * @param {boolean} fromStart - True to restart, false to resume
 */
export const playSong = async (fromStart = false) => {
  if (processor) {
    return false;
  }

  playbackSequence = seq;

  if (fromStart) {
    pos = 0;
  } else {
    if (get(selectedSequence) === null) {
      pos = 0;
    } else {
      setPosition();
    }
  }
  await play();
};


/**
 * Stops playing the current song / pattern
 */
export const stopSong = async () => {
  if (processor) {
    killScriptProcessor();
    songPlaying.set(false);
    channelMeters.set([]);
    isPlaying = false;
    frames = [];
    await unregisterSound();
  }
};


// Subscribe to svelte stores so the renderer can react to state changes.

instruments.subscribe(value => insts = value);

speed.subscribe(value => spd = value);

currentPlaybackLength.subscribe(value => songLength = value);

patterns.subscribe(value => {
  patts = value;
  currentPlaybackLength.set(getSongLength());
});

sequence.subscribe(value => {
  seq = value;
  currentPlaybackLength.set(getSongLength());
});

masterVolume.subscribe(value => {
  gainNode.gain.value = value;
});

sampleRate.subscribe(value => {
  zzfxR = value;
  channels = null;
});

bufferSize.subscribe(value => {
  if (isPlaying) {
    killScriptProcessor();
    currentBufferSize = value;
    initScriptProcessor();
  } else {
    currentBufferSize = value;
  }
});

uiFPS.subscribe(value => targetUpdateFps = value);

patternMuteStates.subscribe(value => mutedTracks = value);
