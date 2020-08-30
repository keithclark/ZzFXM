import { patterns, sequence } from '../stores.js'
import { get } from 'svelte/store';

// TODO: This is almost identical to below, consider making argument optional
// and default to seq.length;

/**
 * Calculates the total song length up to a specific sequence position
 * @param {*} sequencePos
 */
export const getCumlativeRowAtPosition = sequencePos => {
  const patts = get(patterns);
  const seq = get(sequence);
  let row = 0;
  sequencePos = sequencePos % (seq.length);
  for (let sequenceIndex = 0; sequenceIndex < sequencePos; sequenceIndex++) {
    row += patts[seq[sequenceIndex]][0].length - 2;
  }
  return row;
}


/**
 * Calculates the total song length in rows
 * @returns {number} Number of rows in the song
 */
export const getSongLength = () => {
  const patts = get(patterns);
  const seq = get(sequence);
  let length = 0
  for (let sequenceIndex = 0; sequenceIndex < seq.length; sequenceIndex++) {
    length += patts[seq[sequenceIndex]][0].length - 2;
  }
  return length;
}


/**
 * Clears the current song sequence
 */
export const clearSequence = () => {
  sequence.set([]);
};
