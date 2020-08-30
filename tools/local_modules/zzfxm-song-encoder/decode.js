const jsonSafe = str => {
  return str.replace(/\[,/g,'[null,')
    .replace(/,,\]/g,',null]') // remove `undefined` work around
    .replace(/,\s*(?=[,\]])/g,',null')
    .replace(/([\[,]-?)(?=\.)/g,'$10')
    .replace(/-\./g,'-0.');
}


/**
 * Decodes song pattern array, restoring default values
 *
 * @param {Array.<Number>} Pattern paramaters
 */
export const decodePatternParams = pattern => {
  return pattern.map(channel => {
    return [...channel].map(data => data || 0)
  });
}


/**
 * Decodes ZzFX instrument array, restoring default values
 *
 * @param {Array.<Number>} ZzFX paramaters for the instrument
 */
export const decodeInstrumentParams = instrument => {
  const params = instrument.slice();
  params.length = 19;

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
}


/**
 * Decodes a string representation of an instrument into an array of
 * zzfx parameters
 *
 * @param {string} instrument The instrument to decode
 * @returns {Array.<Number>} ZzFX paramaters for the instrument
 */
export const decodeInstrument = instrument => {
  return decodeInstrumentParams(JSON.parse(jsonSafe(instrument)))
}


/**
 * Decodes a string representation of a song into an array
 *
 * @param {string} song The song to decode
 */
export const decodeSong = song => {
  const jsonSong = jsonSafe(song.replace(/^export\s+default\s+/,''));

  const data = JSON.parse(jsonSong, (key, value) => {
    return value === null ? undefined : value;
  });

  data[0] = data[0].map(decodeInstrumentParams);
  data[1] = data[1].map(decodePatternParams);

  return data
}
