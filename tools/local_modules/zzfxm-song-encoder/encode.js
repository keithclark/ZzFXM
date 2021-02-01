/**
 * Encode a number into the smallest possible footprint. Removes leading 0 from
 * decimal numbers and replaces three or more trailing 0's with `e` notation.
 *
 * @param {Number} value
 * @returns {String} the encoded value
 */
export const encodeNumber = value => {
  let encoded = JSON.stringify(value);
  encoded = encoded.replace(/^(-?)0/g, '$1');
  encoded = encoded.replace(/0{3,}$/g, m => `e${m.length}`);
  return encoded;
}


/**
 * Encodes ZzFX instruments into a string, removing values as needed to keep
 * size to a minimum.
 *
 * @param {Array.<Number[]>} instruments
 */
export const encodeInstruments = instruments => {
  return `[${instruments.map(encodeInstrument).join(',')}]`;
}

/**
 * Encodes ZzFX instrument into a string, removing values as needed to keep
 * size to a minimum.
 *
 * @param {Array.<Number[]>} instrument
 */
export const encodeInstrument = instrument => {

  let params = instrument.map((v,i) => {
    let encoded = encodeNumber(v);

    // Volume
    if (i == 0) {
      if (encoded == '1') {
        encoded = '';
      } else if (encoded == '') {
        encoded = '0';
      }
    }

    // Randomness
    else if (i == 1) {
      if (encoded == '.05') {
        encoded = '';
      } else if (encoded == '') {
        encoded = '0';
      }
    }

    // Frequency
    else if (i == 2) {
      // For zzfx() the frequency defaults to 220, but this default is not supported by
      // zzfxm() because it would need to be applied prior to shifting the pitch for a note
      if (encoded == '') {
        encoded = '0';
      }
    }

    // Release
    else if (i == 5) {
      if (encoded == '.1') {
        encoded = '';
      } else if (encoded == '') {
        encoded = '0';
      }
    }

    // Shape Curve
    else if (i == 7) {
      if (encoded == '1') {
        encoded = '';
      } else if (encoded == '') {
        encoded = '0';
      }
    }

    // Sustain Volume
    else if (i == 17) {
      if (encoded == '1') {
        encoded = '';
      } else if (encoded == '') {
        encoded = '0';
      }
    }

    else if (encoded === '0' || encoded === 'null') {
      encoded = ''
    }
    return encoded;
  });


  // We must always return an instrument or the player will choke.
  if (params.length === 0) {
    params = [,0]
  }

  return `[${params.join(',').replace(/,+$/g, '')}]`;
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
    .replace(/,]/g, ',,]')

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
 * Encodes song speed value into a string.
 *
 * @param {Object} panning The song panning data
 */
export const encodeSpeed = speed => {
  if (speed !== 125) {
    return JSON.stringify(speed);
  }
}

/**
 * Encodes song data into a string, removing values as needed to keep size to a
 * minimum.
 *
 * @param {*} song The song to encode
 */
export const encodeSong = song => {
  let elements = [
    encodeInstruments(song[0]),
    encodePatterns(song[1]),
    encodeSequence(song[2]),
    encodeSpeed(song[3]),
    encodeMetadata(song[4])
  ];
  return `[${elements.join(',').replace(/,+$/, '')}]`
}

