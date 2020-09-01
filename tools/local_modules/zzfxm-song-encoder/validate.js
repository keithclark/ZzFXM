const notNumber = v => !isNumber(v);

const notArray = v => !isArray(v);

const notObject = v => !isObject(v);

const isNumber = v => notObject(v) && !isNaN(parseFloat(v));

const isArray = v => Array.isArray(v);

const isObject = v => v !== null && v !== undefined && Object.is(v.constructor, Object);

/**
 * Check a value is a valid song sequence
 *
 * @param {*} sequence - The value to check
 * @returns {true|Error} - `true` if valid, otherwise an `Error`
 */
const validateSequence = sequence => {
  if (notArray(sequence)) {
    return new Error('Missing sequence structure');
  }
  sequence = [...sequence];
  if (sequence.some(notNumber)) {
    return new Error('Invalid sequence parameter type');
  }
  return true;
}


/**
 * Check a value is a valid song patterns object
 *
 * @param {*} patterns - The value to check
 * @returns {true|Error} - `true` if valid, otherwise an `Error`
 */
const validatePatterns = patterns => {
  if (notArray(patterns)) {
    return new Error('Missing pattern structure');
  }
  patterns = [...patterns];
  if (patterns.some(notArray)) {
    return new Error('Invalid pattern structure');
  }
  if (patterns.flat(2).some(notNumber)) {
    return new Error('Invalid pattern parameter type');
  }
  return true;
}


/**
 * Check a value is a valid song instruments object
 *
 * @param {*} instruments - The value to check
 * @returns {true|Error} - `true` if valid, otherwise an `Error`
 */
const validateInstruments = instruments => {
  if (notArray(instruments)) {
    return new Error('Missing instrument structure');
  }
  instruments = [...instruments];
  if (instruments.some(notArray)) {
    return new Error('Invalid instrument structure');
  }
  if (instruments.flat().some(notNumber)) {
    return new Error('Invalid instrument parameter type');
  }
  return true;
}


/**
 * Check a value is a valid song object
 *
 * @param {*} song - The value to check
 * @returns {true|Error} - `true` if valid, otherwise an `Error`
 */

export const validateSong = song => {

  let valid;

  if (!Array.isArray(song)) {
    return new Error('Invalid song syntax');
  }

  valid = validateInstruments(song[0]);
  if (valid instanceof Error) {
    return valid;
  }

  valid = validatePatterns(song[1]);
  if (valid instanceof Error) {
    return valid;
  }

  valid = validateSequence(song[2]);
  if (valid instanceof Error) {
    return valid;
  }

  // Element 3 should be a number (or undefined)
  if (song[3] !== undefined && notNumber(song[3])) {
    return new Error('Invalid speed');
  }

  // Element 4 should be a object (or undefined)
  if (song[4] !== undefined && notObject(song[4])) {
    return new Error('Invalid meta data');
  }

  return true;
};
