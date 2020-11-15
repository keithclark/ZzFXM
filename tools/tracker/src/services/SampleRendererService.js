import { instruments } from '../stores.js';

const sampleCache = new Map();
let insts = [];

/**
 * Returns sample data for an instrument played at a specific note
 *
 * @param {number} instrument The instrument
 * @param {number} note The note to play
 */
export const getSample = (instrument, note) => {
  let instrumentNoteSamples = sampleCache.get(instrument);
  if (!instrumentNoteSamples) {
    instrumentNoteSamples = new Map();
    sampleCache.set(instrument, instrumentNoteSamples)
  }

  let sample = instrumentNoteSamples.get(note);
  if (!sample) {
    console.log(`Generating sample for instrument ${instrument}, note ${note}`);
    sample = renderNote(instrument, note);
    instrumentNoteSamples.set(note, sample)
  }

  return sample;
};


/**
 * Clears all precached note samples for an instrument.
 *
 * @param {number} instrument - The instrument to clear
 */
export const clearSampleCacheForInstrument = instrument => {
  console.log(`Clearing sample cache for instrument ${instrument}`);
  if (sampleCache.has(instrument)) {
    sampleCache.get(instrument).clear();
    return true;
  }
  return false;
};


/**
 * Clear all instrument samples from the cache
 */
export const clearSampleCache = () => {
  console.log('Clearing sample cache');
  sampleCache.clear();
};


/**
 * Generates the sample data for a note played with an instrument
 *
 * @param {number} instrument - Index of the instrument to play
 * @param {number} note - Index of the note to play
 * @returns {Array<number>} Sample data
 */
export const renderNote = (instrument, note) => {
  let instr = [...insts[instrument]];
  instr[2] *= 2 ** ((note - 12) / 12);
  return zzfxG(...instr);
};


// Watch the instruments store and clear the cache if it's changes
instruments.subscribe(value => {
  insts = value;
  clearSampleCache();
});
