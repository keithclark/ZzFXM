import { patterns, instruments, instrumentsMeta, patternsMeta, title, sequence, speed, meta } from '../stores.js'
import { get } from 'svelte/store';
import { decodeSong, encodeSong } from 'zzfxm-song-encoder';
import { addInstrument, clearInstruments, createInstrument } from '../services/InstrumentService.js';
import { addPattern, clearPatterns, createTrack } from '../services/PatternService.js';
import { clearSequence } from '../services/SequenceService.js';
import { removeEmptyStringValues } from '../lib/utils.js';

/**
 * Clear out the current song so it can be populated with new data.
 */
const clearSong = () => {
  clearSequence();
  clearInstruments();
  clearPatterns();
};


/**
 * Creates a new blank song and sets it as the current song
 */
export const createEmptySong = () => {
  setSong([
    [
      createInstrument(1, 0, 400)
    ],
    [
      [
        createTrack(64, 0, -1),
        createTrack(64, 0, 1),
        createTrack(64, 0, -1),
        createTrack(64, 0, 1)
      ]
    ],
    [0],
    125,
    {
      title: 'New Song'
    }
  ]);
}


/**
 * Sets the current song
 * @param {string} data
 */
export const setSong = song => {

  clearSong();
  meta.set(song[4] || {});
  title.set(song[4] && song[4].title || 'Untitled song');
  speed.set(song[3] || 125);
  song[0].forEach((instrument, index) => {
    const name = song[4] && song[4].instruments && song[4].instruments[index];
    addInstrument(instrument, name);
  });

  song[1].forEach((pattern, index) => {
    const name = song[4] && song[4].patterns && song[4].patterns[index];
    addPattern(pattern, name);
  });

  sequence.set(song[2]);
};


/**
 * Serialises the current song into a string
 * @returns {string} the serialised song data
 */
// TODO: rename to `serialize`?
export const serializeSong = (options = {}) => {
  const tidyMeta = removeEmptyStringValues(get(meta));
  let serializedMeta;

  if (!options.noMeta) {
    serializedMeta = {
      ...tidyMeta,
      ...{
        title: get(title),
        instruments: get(instrumentsMeta),
        patterns: get(patternsMeta)
      }
    };
  }

  return encodeSong([
    get(instruments),
    get(patterns),
    get(sequence),
    get(speed),
    serializedMeta
  ]);
};


/**
 * Load song data from a File object and sets it as the current song.
 *
 * @param {File} file
 * @returns {Promise} A promise that resolves when the song has loaded
 */
export const loadSongFromFile = file => {
  const url = URL.createObjectURL(file);
  return loadSongFromUrl(url).finally(() => {
    URL.revokeObjectURL(url);
  });
};


/**
 * Load song data from a remote url and set it as the current song. Remote
 * servers must have the appropriate CORS response headers set for this to work.
 *
 * @param {string} url - The url of the song to load
 * @returns {Promise} A promise that resolves when the song has loaded
 */
export const loadSongFromUrl = url => {
  return fetch(url)
    .then(res => res.text())
    .then(loadSongFromString)
};


/**
 * Load song data from a string and set it as the current song.
 *
 * @param {string} songString — The encoded song data
 */
export const loadSongFromString = songString => {
  setSong(decodeSong(songString));
};
