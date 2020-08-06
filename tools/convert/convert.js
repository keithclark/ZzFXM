import { ZzfxmSongFacade } from 'zzfxm-song-facade';
import { parseProtracker } from 'song-parsers';
import { createInstrumentFromSample } from './lib/instrumentResolver.js';


const EFFECT_CODE_VOLUME_SLIDE = 10;
const EFFECT_CODE_VOLUME = 12;
const EFFECT_CODE_PATTERN_BREAK = 13;
const EFFECT_CODE_SPEED = 15;

const calculateAttenuation = value => {
  return 1 - Math.round(((Math.min(64, value) / 64.5)) * 100) / 100
}

export const convertSong = (buffer, options) => {
  let song = new ZzfxmSongFacade();
  let currentChannel = 0;
  let currentPattern = 0;
  let currentPeriod = 0;
  let currentInstrument = 0;
  let currentAttenuation = 0;
  let currentRow = 0;
  let currentEffectCode = 0;
  let instrumentCount = 0;
  let instrumentMap = new Map();
  let currentSpeed = 0;
  let patternLength = 64;
  let patternInstrumentList = new Map();

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
      song.setPatternRowCount(currentPattern, patternLength);
    } else if (type === 'patternEnd') {
      patternLength = 64;
      patternInstrumentList.clear();
    }
    else if (type === 'row') {
      currentEffectCode = 0;
      currentRow = value;
    }
    else if (type === 'channel') {
      currentChannel = value;
      currentInstrument = null;
      currentAttenuation = 0;
    }
    else if (type === 'channelEnd') {
      if (!currentInstrument) {
        return;
      }

      let instrumentChannel = patternInstrumentList.get(currentInstrument);
      if (instrumentChannel === undefined) {
        instrumentChannel = patternInstrumentList.size
        patternInstrumentList.set(currentInstrument, instrumentChannel);
        song.setPatternChannelCount(currentPattern, instrumentChannel + 1);
        song.setPatternRowCount(currentPattern, patternLength);
        song.setChannelInstrument(currentPattern, instrumentChannel, currentInstrument - 1);
        song.setChannelPanning(currentPattern, instrumentChannel, currentChannel % 2 === 0 ? -1 : 1);
      }

      if (currentPeriod) {
        song.setNotePeriod(currentPattern, instrumentChannel, currentRow, currentPeriod);
      }
      if (currentAttenuation) {
        song.setNoteAttenuation(currentPattern, instrumentChannel, currentRow, currentAttenuation);
      }

    }
    else if (type === 'notePeriod') {
      if (value) {
        value = (70 - (Math.log(value) / Math.log(2) - 7) * 12 | 0) - 36;
      }
      currentPeriod = value;
    }
    else if (type === 'noteInstrument') {
      currentInstrument = instrumentMap.get(value);
    }
    else if (type === 'noteEffectCode') {
      currentEffectCode = value;
      if (value === EFFECT_CODE_PATTERN_BREAK) {
        patternLength = currentRow
        song.setPatternRowCount(currentPattern, patternLength + 1);
      }
    }
    else if (type === 'noteEffectParam') {
      if (currentEffectCode === EFFECT_CODE_VOLUME) {
        currentAttenuation = calculateAttenuation(value);//64 - Math.min(64, value);
      }

      // ZzFXM doesn't support variable song speeds.
      else if (currentEffectCode === EFFECT_CODE_SPEED) {
        if (currentSpeed && value !== currentSpeed) {
          if (!options.ignoreErrors) {
            throw new Error('Variable speeds not supported');
          }
        } else {
          currentSpeed = song.speed = value;
        }
      }

      // ZzFXM doesn't support volume sliding effects but without some sort of
      // support songs can sound terrible so we attempt to make do by forcing an
      // attenutation.
      else if (currentEffectCode === EFFECT_CODE_VOLUME_SLIDE) {
        let volumeSlideVal
        if (value > 15) {
          volumeSlideVal = value >> 4;
        } else {
          volumeSlideVal = -value;
        }
        if (currentRow > 0) {
          let instrumentChannel = patternInstrumentList.get(currentInstrument);
          if (!instrumentChannel) {
            return
          }
          const prevAttenutation = song.getNoteAttenuation(currentPattern, instrumentChannel, currentRow - 1);
          const newAttenuation = Math.max(0, Math.min( prevAttenutation - volumeSlideVal, 64));
          currentAttenuation = calculateAttenuation(newAttenuation);
        }
      }
    }
  });

  song.speed = 125 * 6 / song.speed;

  return song;
}
