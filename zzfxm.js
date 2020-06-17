/**
 * ZzFX Music Generator v1.0.0 by Keith Clark
 */


/**
 * @typedef Channel
 * @type {Array.<Number, Number, Number>}
 * @property {Number} 0 - Note period (1-36)
 * @property {Number} 1 - Instrument (1-16)
 * @property {Number} 2 - Attenuation (1-64)
 */

/**
 * @typedef Pattern
 * @type {Array.<Channel>}
 */

/**
 * @typedef Instrument
 * @type {Array.<Number>} ZzFX sound parameters
 */

/**
 * Generate a song
 *
 * @param {Array.<Instrument>} instruments - Array of ZzFX sound paramaters.
 * @param {Array.<Pattern>} patterns - Array of `pattern` data.
 * @param {Array.<Number>} sequence - Array of `pattern` indexes.
 * @param {Number} [speed=6] - Playback speed of the song
 * @returns {Array.<Number>} Sample data for the song
 *
 * @example
 * const song = zzfxM(
 *   [                                         // Instruments
 *     [,0,219,,,,,1.1,,-.1,-50,-.05,-.01,1],    // #1 - Snare
 *     [2,0,84,,,.1,,.7,,,,.5,,6.7,1,.05]        // #2 - Kick drum
 *   ],
 *   [                                         // Patterns
 *     [               // Pattern 0
 *       [               // Channel 0
 *         1, 1, 0,        // Using instrument 1, play C-1
 *         0, 0, 0,
 *         1, 5, 32,       // Using instrument 1, play E-1 with 50% attenuation
 *         0, 0, 0
 *       ],
 *       [               // Channel 1
 *         2, 8, 0,        // Using instrument 2, play G-1
 *         2, 8, 16,       // Using instrument 2, play G-1 with 25% attenuation
 *         1, 3, 0,        // Using instrument 3, play D-1
 *         0, 0, 0
 *       ]
 *     ]
 *   ],
 *   [                                         // Sequence
 *     0,0,0,0                                   // Play pattern 0 three times
 *   ],
 *   4                                         // Playback speed 4
 * );
 * zzfxP(song);                                // Play the song
 */
const zzfxM = (instruments, patterns, sequence, speed = 6) => {
  let SAMPLE_RATE = 44100;                  // this must match ZzFX sample rate
  let BPM = 125                             // beats per min - always 125
  let ticksPerSecond = 1000 / (2500 / BPM);
  let tickRowSize = SAMPLE_RATE / (ticksPerSecond / speed) | 0;
  let buffer = [];
  let bufferStart = 0
  let bufferPos;
  let bufferOffset;
  let sample
  let sampleCache = {};
  let sampleCacheKey
  let sampleByte
  let sampleOffset;
  let noteIndex;
  let channel;
  let attenuation;
  let instrument;
  let instrumentParams;
  let period;

  sequence.map(patternIndex => {

    // Walk over each channel of the pattern.
    for (channel of patterns[patternIndex]) {

      // for each channel we need to reset the buffer offset so we can layer
      // sample data.
      bufferOffset = bufferStart;

      // Read the channel data.
      for (noteIndex = 0; noteIndex < channel.length; bufferOffset += tickRowSize) {

        // If there's a new instrument, set it.
        instrument = channel[noteIndex++] || instrument;

        // If we have a period then we need to play a note using the current
        // instrument.
        period = channel[noteIndex++];
        if (period) {
          // Reset the attenuation and sample buffer offset so we can play a new
          // note.
          attenuation = sampleOffset = 0;

          // Create a unique key for this sample (this will coerced to a string)
          sampleCacheKey = [period,instrument];

          // If we haven't done so already, build and cache the ZzFX sample for
          // the current period and instrument. Without caching the browser will
          // will hang.
          if (!sampleCache[sampleCacheKey]) {
            instrumentParams = [...instruments[instrument - 1]];
            instrumentParams[2] *= 2 ** ((period - 12) / 12);
            sampleCache[sampleCacheKey] = zzfxG(...instrumentParams);
          }
        }

        // Update the channel attenuation value. We'll use this to control the
        // volume when rendering the sample slice for this row.
        attenuation = (channel[noteIndex++] / 64) || attenuation;

        // Fill the buffer data for this channel. If there's a sample to play
        // (a new note or the remaining sample data from the previous row),
        // merge with the values already in the buffer. If the buffer is empty
        // we need to prefill it with `0` values for periods of slience to
        // prevent the clicking and popping noises caused by `undefined` values
        // in some browsers.
        sample = sampleCacheKey && sampleCache[sampleCacheKey];
        for (bufferPos = bufferOffset; bufferPos < bufferOffset + tickRowSize; bufferPos++) {
          sampleByte = sample && (sample[sampleOffset++] * (1 - attenuation)) || 0;
          buffer[bufferPos] = (buffer[bufferPos] || 0) + sampleByte;
        }
      }
    }

    bufferStart = bufferPos;
  });

  return buffer;
}
