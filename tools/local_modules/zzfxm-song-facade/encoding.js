export const encodeNumber = value => {
  return JSON.stringify(value).replace(/^(-?)0/g, '$1');
}

/**
 * Encodes ZzFX instruments into a string, removing values as needed to keep
 * size to a minimum.
 *
 * @param {Array.<Number[]>} instruments
 */
export const encodeInstruments = instruments => {
  let v = []
  for (let instrument of instruments) {
    let x = [];
    if (instrument) {
      x = instrument.map((v,i) => {
        let encoded = encodeNumber(v);

        // zzfx defaults volume to `1` so we strip if
        if (i == 0 && encoded == '1') {
          encoded = ''
        }
        // zzfx defaults `randomness` to `.05` - we need to restore the `0`
        else if (i == 1 && encoded == '') {
          encoded = '0';
        }
        // zzfx defaults `release` to `.1` - we need to restore the `0`
        else if (i == 5 && encoded == '') {
          encoded = '0';
        }
        // zzfx defaults `shapeCurve` to `1` - we need to restore the `0`
        else if (i == 7 && encoded == '') {
          encoded = '0';
        }
        return encoded;
      });
    }

    // We must always return an instrument or the player will choke.
    if (x.length === 0) {
      x = [0,,0]
    }
    v.push(`[${x.join().replace(/,+\]/g,']')}]`);
  }
  return `[${v.join()}]`;
}

/**
 * Encodes song patterns into a string, removing values as needed to keep
 * size to a minimum.
 *
 * @param {Array>} patterns The song pattern list
 */
export const encodePatterns = patterns => {
  return JSON.stringify(patterns)
    .replace(/null/g, '')
    .replace(/(\D)0(?=\D)/g, '$1')
}


/**
 * Encodes song sequence into a string.
 *
 * @param {Array.<Number>} sequence The song sequence
 */
export const encodeSequence = sequence => {
  return JSON.stringify(sequence);
}


/**
 * Encodes song metadata into a string.
 *
 * @param {Object} metadata The song meta data
 */
export const encodeMetadata = metaData => {
  return JSON.stringify(metaData);
}


/**
 * Encodes song data into a string, removing values as needed to keep size to a
 * minimum.
 *
 * @param {*} song The song to encode
 */
export const encodeSong = song => {
  return `[${encodeInstruments(song[0])},${encodePatterns(song[1])},${encodeSequence(song[2])},${song[3]},${encodeMetadata(song[4])}]`;
}
