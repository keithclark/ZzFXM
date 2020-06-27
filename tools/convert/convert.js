import { ZzfxmSongFacade } from 'zzfxm-song-facade';
import { parseProtracker } from 'song-parsers';
import { createInstrumentFromSample } from './lib/instrumentResolver.js';


const EFFECT_CODE_VOLUME_SLIDE = 10;
const EFFECT_CODE_VOLUME = 12;
const EFFECT_CODE_PATTERN_BREAK = 13;
const EFFECT_CODE_SPEED = 15;

export const convertSong = (buffer, options) => {
  let song = new ZzfxmSongFacade();
  let currentChannel = 0;
  let currentPattern = 0;
  let currentRow = 0;
  let currentEffectCode = 0;
  let instrumentCount = 0;
  let instrumentMap = new Map();
  let currentSpeed = 0;
  let patternLength = 64;

  parseProtracker(buffer, (token) => {
    let {type, value} = token;

    if (currentRow > patternLength && type !== 'patternEnd') {
      return
    }

    if (type === 'title') {
      song.title = value;
    }
    else if (type === 'channelCount') {
      for (let c = 0; c < value; c++) {
        song.setChannelPanning(c, c%2 === 0 ? -1 : 1);
      }
      song.setMeta('channels', value);
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
        song.setInstrument(instrumentIndex - 1, instrument);
        song.setInstrumentName(instrumentIndex - 1, value.name);
      }
    }
    else if (type === 'pattern') {
      currentPattern = value;
      // console.log(`Pattern ${currentPattern}`)
      song.setPatternCount(currentPattern + 1)
      song.setPatternChannelCount(currentPattern, 4);
      song.setPatternRowCount(currentPattern, patternLength);
    } else if (type === 'patternEnd') {
      patternLength = 64;
    }
    else if (type === 'row') {
      currentEffectCode = 0;
      currentRow = value;
    }
    else if (type === 'channel') {
      currentChannel = value;
    }
    else if (type === 'notePeriod') {
      if (value) {
        value = (70 - (Math.log(value) / Math.log(2) - 7) * 12 | 0) - 36;
      }
      song.setNotePeriod(currentPattern, currentChannel, currentRow, value);
    }
    else if (type === 'noteInstrument') {
      song.setNoteInstrument(currentPattern, currentChannel, currentRow, instrumentMap.get(value));
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
        value = 64 - Math.min(64, value);
        song.setNoteAttenuation(currentPattern, currentChannel, currentRow, value);
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
          const prevAttenutation = song.getNoteAttenuation(currentPattern, currentChannel, currentRow - 1);
          const newAttenuation = Math.max(0, Math.min( prevAttenutation - volumeSlideVal, 64))
          song.setNoteAttenuation(currentPattern, currentChannel, currentRow, newAttenuation);
        }
      }
    }
  });

  return song;
}
