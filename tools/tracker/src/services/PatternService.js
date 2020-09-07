import { patterns, patternsMeta, patternMuteStates } from '../stores.js';
import { clamp, round } from '../lib/utils.js';

// This is used to auto-name patterns
let patternNo = 0;


/**
 * Add a pattern to the current song
 *
 * @param {Array.<Channel>} pattern - New pattern data
 * @param {string} name - New pattern name
 * @returns {number} The new instruments index
 */
// TODO: refactor to use setPattern?
export const addPattern = (pattern, name = `Pattern ${patternNo}`) => {
  let newIndex;
  patterns.update(patterns => {
    patterns.push(pattern);
    newIndex = patterns.length - 1;
    return patterns;
  });
  patternsMeta.update(meta => {
    meta.push(name);
    return meta;
  });
  patternMuteStates.update(states => {
    states.push(new Array(pattern.length).fill(false));
    return states;
  });
  patternNo++;
  return newIndex;
};


/**
 * Delete a pattern from the current song
 *
 * @param {number} index - Index of the pattern to remove
 */
export const deletePattern = index => {
  patterns.update(patterns => {
    patterns.splice(index, 1)
    return patterns;
  });
  patternsMeta.update(meta => {
    meta.splice(index, 1)
    return meta;
  });
  patternMuteStates.update(states => {
    states.splice(index, 1);
    return states;
  });
};


/**
 * Remove all patterns from the current song. Also resets the pattern number
 * used to generate pattern names.
 */
export const clearPatterns = () => {
  patternNo = 0;
  patterns.set([]);
  patternsMeta.set([]);
  patternMuteStates.set([]);
};


/**
 * Add a new track to an existing pattern using an optional instrument and
 * panning value.
 *
 * @param {number} pattern to add the track to
 * @param {number} instrument number to use for the track
 * @param {number} panning value for the track
 */
export const addChannel = (pattern, instrument = 0, panning = 0) => {
  let newIndex;
  patterns.update(patterns => {
    newIndex = patterns[pattern].length;
    const rowCount = patterns[pattern][0].length - 2;
    patterns[pattern].push(createTrack(rowCount, instrument, panning));
    return patterns;
  });
  patternMuteStates.update(states => {
    states[pattern].push(false);
    return states;
  });
  return newIndex;
};


/**
 * Delete a track from a pattern
 *
 * @param {*} pattern - Index of the pattern to delete the track from
 * @param {*} channel - Index of the track to delete
 */
export const deleteChannel = (pattern, channel) => {
  patterns.update(patterns => {
    patterns[pattern].splice(channel, 1);
    return patterns;
  });
  patternMuteStates.update(states => {
    states[pattern].splice(channel, 1);
    return states;
  });
};


/**
 * Add a blank row to each track in a pattern.
 * @param {number} pattern - Index of the pattern to add the row to
 */
export const addRow = pattern => {
  let newIndex;
  patterns.update(patterns => {
    newIndex = patterns[pattern][0].length - 2;
    patterns[pattern].forEach(channel => channel.push(0))
    return patterns;
  });
  return newIndex;
};


/**
 * Removes a row from a pattern
 *
 * @param {number} pattern - Index of the pattern to remove the row from
 * @param {number} row - Index of the row to remove
 */
export const deleteRow = (pattern, row) => {
  patterns.update(patterns => {
    patterns[pattern].forEach(channel => {
      channel.splice(row + 2, 1);
    });
    return patterns;
  });
};


/**
 * Clears note and attenuation data from a row of a pattern
 *
 * @param {number} pattern - Index of the pattern to clear data from
 * @param {number} row - Index of the row to clear
 */
export const clearRow = (pattern, row) => {
  patterns.update(patterns => {
    patterns[pattern].forEach(track => {
      track[row + 2] = 0;
    });
    return patterns;
  });
};


/**
 * Creates an empty track object
 *
 * @param {number} rows - Number of rows in the ctrack
 * @param {number} instrument - Instrument for the track
 * @param {number} panning - Panning value for the track
 */
export const createTrack = (rows = 64, instrument = 0, panning = 0) => {
  return [instrument, panning, ...new Array(rows).fill(0)];
};


/**
 * Creates an empty pattern object
 *
 * @param {*} tracks - Number of tracks for the new pattern
 * @param {*} rows - Number of rows for the new pattern
 */
export const createPattern = (tracks = 3, rows = 64) => {
  return new Array(tracks).fill(0).map(() => createTrack(rows));
};


/**
 * Sets the data of a pattern
 *
 * @param {number} pattern - Index of the pattern to update
 * @param {Array} data - Data for the new pattern
 */
export const setPatternData = (pattern, data) => {
  patterns.update(patterns => {
    patterns[pattern] = data
    return patterns;
  });
};


/**
 * Adjust the attentuation of a note.
 *
 * @param {number} pattern - Index of the pattern containing the value to update
 * @param {number} channel - Index of the channel containing the value to update
 * @param {number} row - Index of the row containing the value to update
 * @param {number} step - Value to adjust attenutation by
 */
export const adjustAttenuation = (pattern, channel, row, step) => {
  patterns.update(patterns => {
    const channelRows = patterns[pattern][channel];
    const note = channelRows[row + 2] | 0;
    const attenuation = round(channelRows[row + 2] % 1, 2);
    channelRows[row + 2] = note + clamp(attenuation + step, 0, .99);
    return patterns;
  });
};


/**
 * Set a note
 *
 * @param {number} pattern - Index of the pattern containing the note to update
 * @param {number} channel - Index of the channel containing the note to update
 * @param {number} row - Index of the row containing the note to update
 * @param {number} note - The new note
 */
export const setNote = (pattern, channel, row, note) => {
  patterns.update(patterns => {
    const channelRows = patterns[pattern][channel];
    const currentAttenuation = round(channelRows[row + 2] % 1, 2);
    channelRows[row + 2] = note + currentAttenuation;
    return patterns;
  });
};
