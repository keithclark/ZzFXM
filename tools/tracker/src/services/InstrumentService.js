import { instruments, instrumentsMeta } from '../stores.js';
import { decodeInstrumentParams } from 'zzfxm-song-encoder';

let instrumentNo = 0;

/**
 * Add a new instrument to the current song
 *
 * @param {Array} params - ZzFX instrument parameters of the new instrument
 * @param {string} name - Name of the new instrument
 * @returns {number} Index of the new instrument
 */
export const addInstrument = (params, name = `Instrument ${instrumentNo}`) => {
  let newIndex;
  instruments.update(instruments => {
    instruments.push(createInstrument(...params));
    newIndex = instruments.length - 1;
    return instruments;
  });
  instrumentsMeta.update(meta => {
    meta.push(name);
    return meta;
  });
  instrumentNo++;
  return newIndex;
};


/**
 * Delete an instrument from the current song
 *
 * @param {number} index - Index of the instrument to remove
 */
export const deleteInstrument = index => {
  instruments.update(instruments => {
    instruments.splice(index, 1);
    return instruments;
  });
  instrumentsMeta.update(meta => {
    meta.splice(index, 1);
    return meta;
  });
  instrumentNo++;
};


/**
 * Sets the ZzFX parameters of an existing instrument.
 *
 * @param {*} index - Index of the instrument to update
 * @param {Array} params - ZzFX instrument parameters of the new instrument
 */
export const setInstrumentParams = (index, params) => {
  instruments.update(instruments => {
    instruments[index] = createInstrument(...params);
    return instruments;
  });
};


/**
 * Clears all instrument data from the current song;
 */
export const clearInstruments = () => {
  instrumentNo = 0;
  instruments.set([]);
  instrumentsMeta.set([]);
};


/**
 * Create a new instrument
 *
 * @param  {...number} ZzFX paramaters
 */
export const createInstrument = (...params) => {
  return decodeInstrumentParams(params);
};
