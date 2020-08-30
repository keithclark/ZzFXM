import { patterns, instruments, sequence, speed, selectedRow, selectedPattern, selectedSequence, channelMeters, masterVolume, currentPlaybackLength, songPlaying } from '../stores.js'
import { getCumlativeRowAtPosition, getSongLength } from '../services/SequenceService.js';
import { get } from 'svelte/store';


zzfxX.suspend();


let processor;
let insts;
let patts;
let seq;
let spd;
let pos = 0;
let playbackSequence;
let currentOffset = 0;
let channels = [];
let songLength;
let activeSoundCount = 0;


const gainNode = zzfxX.createGain();
gainNode.gain.value = .5;
gainNode.connect(zzfxX.destination);


const registerSound = async () => {
  if (activeSoundCount === 0) {
    await zzfxX.resume();
  }
  activeSoundCount++;
}


const unregisterSound = async () => {
  activeSoundCount--;
  if (activeSoundCount === 0) {
    await zzfxX.suspend();
  }
}


const initProcessor = () => {
  processor = zzfxX.createScriptProcessor(4096, 0, 2);
  processor.onaudioprocess = audioCallback;
  processor.connect(gainNode);
}


const setPosition = () => {
  pos = getCumlativeRowAtPosition(get(selectedSequence))
  pos += get(selectedRow)
  currentOffset = 0;
  channels = [];
}


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
  return getPositionInfo(position % (nextPos + 1))
}



function nextTick() {
  pos %= songLength;
  const {sequence, pattern, row} = getPositionInfo(pos);
  if (playbackSequence === seq) {
    selectedSequence.set(sequence);
    selectedPattern.set(pattern);
  }
  selectedRow.set(row);

  patts[pattern].forEach((channel, i) => {
    const data = channel[row + 2];
    if (data) {
      let note = data | 0;
      let attenuation = data % 1;

      if (note) {
        if (note === -1) {
          channels[i] = null
          return;
        }
        channels[i] = {
          panning: channel[1],
          attenuation: attenuation,
          sample: renderNote(channel[0], note),
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
}


const addChannel = (channel, start, length, leftChannelData, rightChannelData) => {
  if (!channel) {
    return 0;
  }
  const step = zzfxR / zzfxX.sampleRate;
  const {panning, attenuation, sample} = channel;
  let peak = 0;

  for (let i = start; i < start + length; i++) {
    if (channel.offset >= sample.length) {
      break;
    }

    const data = (1 - attenuation) * sample[0 | channel.offset] || 0;
    leftChannelData[i] += -data * panning + data;
    rightChannelData[i] += data * panning + data;
    peak = Math.max(Math.abs(data), peak);
    channel.offset += step;
  }
  return peak;
};


const audioCallback = event => {
  const { outputBuffer } = event;
  const dataL = outputBuffer.getChannelData(0).fill(0);
  const dataR = outputBuffer.getChannelData(1).fill(0);
  let bufferRemaining = outputBuffer.length;

  let offset = 0;
  let beatLength = zzfxX.sampleRate / spd * 60 >> 2;
  let peakLevels;

  while (bufferRemaining > 0) {
    const beatDuration = Math.min(bufferRemaining, beatLength - currentOffset);

    if (currentOffset >= beatLength) {
      nextTick();
      currentOffset -= beatLength;
    }

    let levels = channels.map(channel => {
      return addChannel(channel, offset, beatDuration, dataL, dataR);
    });

    if (!peakLevels) {
      peakLevels = levels;
      channelMeters.set(peakLevels);
    }

    offset += beatDuration;
    currentOffset += beatDuration;
    bufferRemaining -= beatDuration;
  }
};


export const renderNote = (instrument, note) => {
  let instr = [...insts[instrument]];
  instr[2] *= 2 ** ((note - 12) / 12);
  return zzfxG(...instr);
};


export const playNote = async (instrument, note) => {
  await registerSound();
  const node = zzfxP([...renderNote(instrument, note)]);
  node.onended = unregisterSound;
  return node;
};


export const playSound = async (params) => {
  await registerSound();
  const node = zzfxP([...zzfxG(...params)]);
  node.onended = unregisterSound;
  return node;
};


export const playPattern = async (pattern, fromStart) => {
  if (processor) {
    return false;
  }

  playbackSequence = [pattern];
  if (fromStart) {
    pos = 0;
  } else {
    pos = get(selectedRow);
  }

  initProcessor();
  await registerSound();
  songPlaying.set(true);
};


export const playSong = async fromStart => {
  if (processor) {
    return false;
  }

  playbackSequence = seq;
  if (fromStart) {
    pos = 0;
  } else {
    if (get(selectedSequence) === null) {
      pos = 0
    } else {
      setPosition();
    }
  }

  initProcessor();
  await registerSound();
  songPlaying.set(true);
};


export const stopSong = async () => {
  if (processor) {
    processor.onaudioprocess = null;
    processor.disconnect(gainNode);
    processor = null;
    channelMeters.set([]);
    await unregisterSound();
    songPlaying.set(false)
  }
};


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
