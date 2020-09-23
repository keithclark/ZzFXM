import { validateSong } from './validate.js';


/**
 * Parse a short-json string into an object.
 *
 * @param {string} str - the string to parse
 */
const parse = str => {
  return JSON.parse(jsonSafe(str), (key, value) => {
    if (value === null) {
      return undefined;
    }
    return value;
  });
};


/**
 * Converts a serialised JS object into JSON compatiable format
 * @param {*} str - the string to convert
 */
const jsonSafe = str => {
  return str.replace(/\[,/g,'[null,')
    .replace(/,,\]/g,',null]') // remove `undefined` work around
    .replace(/,\s*(?=[,\]])/g,',null')
    .replace(/([\[,]-?)(?=\.)/g,'$10')
    .replace(/-\./g,'-0.');
};


/**
 * Decodes song pattern array, restoring default values
 *
 * @param {Array.<Number>} Pattern paramaters
 */
export const decodePatternParams = pattern => {
  return pattern.map(channel => {
    return [...channel].map(data => data || 0)
  });
};


/**
 * Decodes ZzFX instrument array, restoring default values
 *
 * @param {Array.<Number>} ZzFX paramaters for the instrument
 */
export const decodeInstrumentParams = instrument => {
  const params = instrument.slice();
  params.length = 20;

  return [...params].map((param, index) => {
    if (index === 0 && param === undefined) {
      return 1;
    }
    if (index === 1 && param === undefined) {
      return 0.05;
    }
    if (index === 2 && param === undefined) {
      return 220;
    }
    if (index === 5 && param === undefined) {
      return .1;
    }
    if (index === 7 && param === undefined) {
      return 1;
    }
    if (index === 17 && param === undefined) {
      return 1;
    }
    return param || 0;
  });
};


/**
 * Decodes a string representation of an instrument into an array of
 * zzfx parameters
 *
 * @param {string} instrument The instrument to decode
 * @returns {Array.<Number>} ZzFX paramaters for the instrument
 */
export const decodeInstrument = instrument => {
  return decodeInstrumentParams(parse(instrument))
};


/**
 * Decodes a string representation of a song into an array
 *
 * @param {string} song The song to decode
 */
export const decodeSong = song => {
  let data;

  try {
    data = parse(song);
  } catch (e) {
    throw new Error('Invalid file format');
  }

  const valid = validateSong(data);

  if (valid instanceof Error) {
    throw valid;
  }

  data[0] = data[0].map(decodeInstrumentParams);
  data[1] = data[1].map(decodePatternParams);

  return data;
};
