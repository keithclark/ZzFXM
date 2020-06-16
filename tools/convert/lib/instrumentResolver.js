import { instruments } from './instruments.js';


export const createInstrumentFromSample = (sample, options = {}) => {
  let sampleName = sample.name.toLowerCase();
  let bestInstrument;

  for (let instrument of instruments) {
     // If we have a perfect size and name match, return it.
    if (instrument.size === sample.size) {
      if (instrument.name === sampleName || instrument.alias.includes(sampleName)) {
        bestInstrument = instrument;
        break;
      }
    }
  }

  // substring match
  if (!bestInstrument && options.partialNames) {
    let longestMatch = '';
    for (let instrument of instruments) {
      if (!instrument.alias) {
        continue;
      }
      for (let alias of instrument.alias) {
        if (sampleName.indexOf(alias) > -1) {
          if (alias.length > longestMatch.length) {
            longestMatch = alias;
            bestInstrument = instrument
          }
        }
      }
    }
  }

  // Fallback to closest file size
  if (!bestInstrument && options.nearestSize) {
    let closestSizeDifference = Number.MAX_VALUE;
    if (!bestInstrument) {
      for (let instrument of instruments) {
        let sizeDifference = Math.abs(instrument.size - sample.size);
        if (sizeDifference < closestSizeDifference) {
          closestSizeDifference = sizeDifference;
          bestInstrument = instrument;
        }
      }
    }
  }

  if (bestInstrument) {
    return bestInstrument.zzfx.slice();
  }

  return [0,0,0];

}
