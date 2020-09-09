import { ZzfxmSongFacade } from 'zzfxm-song-facade';
import { parseProtracker } from 'song-parsers';
import { createInstrumentFromSample } from './lib/instrumentResolver.js';


const EFFECT_CODE_VOLUME_SLIDE = 0xa;
const EFFECT_CODE_POSITION_JUMP = 0xb;
const EFFECT_CODE_VOLUME = 0xc;
const EFFECT_CODE_PATTERN_BREAK = 0xd;
const EFFECT_CODE_SPEED = 0xf;

const EFFECT_CODE_NAMES = {
  0x00: 'Arpeggio',
  0x01: 'Slide up',
  0x02: 'Slide down',
  0x03: 'Slide to note',
  0x04: 'Vibrato',
  0x05: 'Slide to note + volume',
  0x06: 'Vibrato + volume',
  0x07: 'Tremolo',
  0x08: 'Panning',
  0x09: 'Set sample offset',
  [EFFECT_CODE_VOLUME_SLIDE]: 'Volume slide',
  [EFFECT_CODE_POSITION_JUMP]: 'Position jump',
  [EFFECT_CODE_VOLUME]: 'Set volume',
  [EFFECT_CODE_PATTERN_BREAK]: 'Position jump',
  0xe0: 'Filter on/off',
  0xe1: 'Porta up (fine)',
  0xe2: 'Porta down (fine)',
  0xe3: 'Glissando control',
  0xe4: 'Vibrato waveform',
  0xe5: 'Set finetune',
  0xe6: 'Pattern loop',
  0xe7: 'Tremolo waveform',
  0xe8: 'Not implemented',
  0xe9: 'Retrigger note',
  0xea: 'Volume slide up (fine)',
  0xeb: 'Volume slide down (fine)',
  0xec: 'Cut note',
  0xed: 'Delay note',
  0xee: 'Pattern delay',
  [EFFECT_CODE_SPEED]: 'Set speed'
};


export const round = (value, decimalPlaces = 2) => {
  const pow = Math.pow(10, decimalPlaces);
  return Math.round(value * pow) / pow;
};


const calculateAttenuation = value => {
  return Math.min(.99, round(1 - Math.min(64, value) / 64))
};


export const convertSong = (buffer, options) => {
  const song = new ZzfxmSongFacade();
  let currentChannel = 0;
  let currentPattern = 0;
  let currentRow = 0;
  let currentEffectCode = 0;
  let instrumentCount = 0;
  let currentSpeed = 0;
  let patternLength = 64;
  const instrumentMap = new Map();
  const patternInstrumentList = new Map();
  const channelState = new Map();
  const warnings = [];

  const reportWarning = message => {
    if (!warnings.includes(message)) {
      warnings.push(message);
    }
  }

  const reportUnsupportedEffect = code => {
    let niceCode = code.toString(16).toUpperCase().padEnd(3, 'xy');
    let message = `ZzFXM doesn't support effect: "${code.toString(16).toUpperCase().padEnd(3, 'xy')}"`;
    if (code in EFFECT_CODE_NAMES) {
      message = `"${EFFECT_CODE_NAMES[code]}" effect (${niceCode}) is not supported`
    } else {
      message = `Unknown effect "${niceCode}" is not supported`
    }
    reportWarning(message);
  }


  const reportError = message => {
    const err = new Error(message);
    err.code = 'ERR_ZZFXM_NO_SUPPORT';
    throw err;
  }


  parseProtracker(buffer, (token) => {
    let {type, value} = token;

    if (currentRow > patternLength && type !== 'patternEnd') {
      return;
    }

    if (type === 'title') {
      song.title = value;
    }
    else if (type === 'sequence') {
      value.forEach((value, index) => {
        song.setSequencePattern(index, value)
      });
    }
    else if (type === 'sampleMeta') {
      instrumentCount++;
      if (value.size) {
        console.log(value)
        let instrument;
        const instrumentIndex = instrumentMap.size + 1;
        if (options.noInstruments) {
          instrument = [];
        } else {
          instrument = createInstrumentFromSample(value, {
            nearestSize: !options.saneInstruments,
            partialNames: true
          });
          // TODO: Apply sample volume to zzfx params
        }
        instrumentMap.set(instrumentCount, instrumentIndex);
        song.setInstrumentCount(instrumentMap.size);
        song.setInstrument(instrumentIndex - 1, instrument);
        song.setInstrumentName(instrumentIndex - 1, value.name || `Instrument ${instrumentMap.size}`);
      }
    }
    else if (type === 'pattern') {
      currentPattern = value;
      song.setPatternCount(currentPattern + 1);
      song.setPatternChannelCount(currentPattern, 1);
      song.setPatternRowCount(currentPattern, patternLength);
    } else if (type === 'patternEnd') {
      patternLength = 64;
      patternInstrumentList.clear();
      channelState.clear();
    }
    else if (type === 'row') {
      currentEffectCode = 0;
      currentRow = value;
    }
    else if (type === 'channel') {
      currentChannel = value;
      if (!channelState.has(currentChannel)) {
        channelState.set(currentChannel, {
          attenuation: 0
        });
      }
    }
    else if (type === 'channelEnd') {
      const {instrument, attenuation, note, lastAttenuation} = channelState.get(currentChannel);

      if (!instrument) {
        return;
      }

      // ZzFXM form only supports one instrument per channel so we may need to
      // split a single pattern channel across multiple tracks.
      const mapKey = `${currentChannel}:${instrument}`;
      let instrumentChannel = patternInstrumentList.get(mapKey);
      if (instrumentChannel === undefined) {
        instrumentChannel = patternInstrumentList.size
        patternInstrumentList.set(mapKey, instrumentChannel);
        song.setPatternChannelCount(currentPattern, instrumentChannel + 1);
        song.setPatternRowCount(currentPattern, patternLength);
        song.setChannelInstrument(currentPattern, instrumentChannel, instrument - 1);
        song.setChannelPanning(currentPattern, instrumentChannel, currentChannel % 2 === 0 ? -1 : 1);
      }
      if (note) {
        song.setNotePeriod(currentPattern, instrumentChannel, currentRow, note);
      }
      if (attenuation && lastAttenuation !== attenuation) {
        song.setNoteAttenuation(currentPattern, instrumentChannel, currentRow, attenuation);
      }

      channelState.get(currentChannel).lastAttenuation = attenuation;
    }

    else if (type === 'notePeriod') {
      if (value) {
        value = (70 - (Math.log(value) / Math.log(2) - 7) * 12 | 0) - 36;
      }
      const state = channelState.get(currentChannel);
      state.note = value;
      if (value) {
        state.lastNote = state.note;
        state.lastAttenuation = 0;
        state.attenuation = 0;
      }
    }

    else if (type === 'noteInstrument') {
      if (value) {
        const state = channelState.get(currentChannel);
        state.instrument = instrumentMap.get(value);
        // It's valid to set an instrument without setting a note. In this case
        // the previously played note is replayed using new instrument. So we
        // have to update the channel state to reflect this.
        if (!state.note) {
          state.note = state.lastNote;
          state.lastAttenuation = 0;
          state.attenuation = 0;
        }
      }
    }

    else if (type === 'noteEffectCode') {
      currentEffectCode = value;
    }

    else if (type === 'noteEffectParam') {

      // If there's no current effect we don't need to do anything.
      if (!currentEffectCode) {
        return;
      }

      // Position jumping isn't possible in ZzFXM so we need to stop converting
      // if the song is using the effect. Conversion can be forced using the
      // `ignoreErrors` option, but the song is likely to be structured
      // incorrectly and therefore won't play as expected.
      if (currentEffectCode === EFFECT_CODE_POSITION_JUMP) {
        if (!options.ignoreErrors) {
          reportError("ZzFXM doesn't support position jumps");
        } else {
          reportUnsupportedEffect(currentEffectCode);
        }
      }

      // Pattern breaks are only supported if the pattern breaks to the first
      // row of the next pattern in the song sequence. If the break effect tries
      // to start at a row offset other than zero we need to stop. Conversion
      // can be forced using the  `ignoreErrors` option, but the song is likely
      // to be structured incorrectly and therefore won't play as expected.
      else if (currentEffectCode === EFFECT_CODE_PATTERN_BREAK) {
        if (value !== 0) {
          if (!options.ignoreErrors) {
            reportError("ZzFXM doesn't support pattern breaks to specific rows");
          } else {
            reportUnsupportedEffect(currentEffectCode);
          }
        }
        patternLength = currentRow;
        song.setPatternRowCount(currentPattern, patternLength + 1);
      }

      // Volume effects map to ZzFXM's note attenuation feature.
      else if (currentEffectCode === EFFECT_CODE_VOLUME) {
        const state = channelState.get(currentChannel);
        state.attenuation = calculateAttenuation(value);
      }

      // ZzFXM doesn't support variable song speeds. If the song uses the effect
      // we need to stop converting. Conversion can be forced using the
      // `ignoreErrors` option, but parts of the song are likely to be be played
      // at incorrect speed.
      else if (currentEffectCode === EFFECT_CODE_SPEED) {
        if (currentSpeed && value !== currentSpeed) {
          if (!options.ignoreErrors) {
            reportError("ZzFXM doesn't support variable speeds");
          } else {
            reportUnsupportedEffect(currentEffectCode);
          }
        } else {
          currentSpeed = song.speed = value;
        }
      }

      // ZzFXM doesn't support volume sliding effects. But! without some sort of
      // volume adjustment, songs that use this effect generally sound terrible.
      // To counter this we attempt to make do by calcuating an attenutation
      // value that accumulates over successive rows. There's no smooth
      // inter-row volume slide but adjustmens that take place over a few rows
      // do sound better with this trick.
      else if (currentEffectCode === EFFECT_CODE_VOLUME_SLIDE) {
        reportWarning(`"Volume sliding" effects were replaced with computed "Set volume" effects`);
        let volumeSlideVal;
        if (value > 15) {
          volumeSlideVal = value >> 4;
        } else {
          volumeSlideVal = value;
        }
        const state = channelState.get(currentChannel);
        const newAttenuation = Math.max(0, Math.min(1, state.attenuation + volumeSlideVal / 64));
        state.attenuation = round(newAttenuation);
      }

      // All other effect codes lead here. We add the code to the conversion
      // report so they can be interrogated by the calling funciton.
      else {
        // For effects in the range Exy`, x has a different meaning. We add the
        // first nibble to to effect code so we can be more specific when
        // reporting the problem.
        if (currentEffectCode === 0xe) {
          currentEffectCode = (currentEffectCode << 4) + (value >> 4);
        }
        reportUnsupportedEffect(currentEffectCode);
      }
    }
  });

  // If song speed is less than 32 then convert it to BPM.
  if (song.speed < 32) {
    song.speed = 125 * 6 / song.speed;
  }

  return { song, warnings };
}
