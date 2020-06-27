import { setArrayLength } from './utils.js';
import { encodeSong, decodeSong } from './encoding.js';

const INSTRUMENT_INDEX = 0;
const PATTERN_INDEX = 1;
const SEQUENCE_INDEX = 2;
const SPEED_INDEX = 3;
const PANNING_INDEX = 4;
const META_INDEX = 5;


export class ZzfxmSongFacade {

  constructor(data = [[],[],[], 6]) {
    this._data = data;
    this._length = null;
  }

  /**
   * Set song meta data
   *
   * @param {String} key Name of the property to set
   * @param {*} value New value of the property to set
   */
  setMeta(name, value) {
    if (!this._data[META_INDEX]) {
      this._data[META_INDEX] = {};
    }
    this._data[META_INDEX][name] = value;
  }

  /**
   * Return song meta data
   *
   * @param {String} key Name of the property to get
   * @returns {*} New value of the property or null if it doesn't exist
   */
  getMeta(name) {
    if (this._data[META_INDEX]) {
      return this._data[META_INDEX][name];
    } else {
      return null;
    }
  }

  /**
   *
   */
  clearMeta() {
    delete this._data[META_INDEX];
  }

  /**
   * Get/set the title of the song
   * @type String
   */
  set title(value) {
    return this.setMeta('title', value);
  }

  get title() {
    return this.getMeta('title');
  }

  /**
   * Get/set the speed of the song
   * @type Number
   */
  get speed() {
    return this._data[SPEED_INDEX];
  }

  set speed(value) {
    this._data[SPEED_INDEX] = value;
  }

  /**
   * The length of the song, in rows
   */
  get length() {
    if (this._length === null) {
      this._length = 0;
      this._data[SEQUENCE_INDEX].forEach(patternIndex => {
        this._length += this.getPatternLength(patternIndex);
      });
    }
    return this._length;
  }

  /**
   * Get the pattern at a specific sequence position
   *
   * @param {Number} position The sequence position to get
   * @returns {Number} The pattern index at the position
   */
  getSequencePattern(position) {
    return this._data[SEQUENCE_INDEX][position];
  }

  /**
   * Get the pattern at a specific sequence position
   *
   * @param {Number} position The sequence position to set
   * @param {Number} new Pattern index
   */
  setSequencePattern(position, value) {
    this._data[SEQUENCE_INDEX][position] = value;
  }

  /**
   * Returns the length of the sequence
   *
   * @returns {Number} The number of sequence steps in the song
   */
  getSequenceLength() {
    return this._data[SEQUENCE_INDEX].length;
  }

  /**
   * Returns the number of instruments used in the current song
   *
   * @returns {Number} The instrument count
   */
  getInstrumentCount() {
    return this._data[INSTRUMENT_INDEX].length;
  }

  /**
   * Returns the zzfx parameters for an instrument
   *
   * @param {Number} index The instrument to get
   * @returns {Number[]} ZzFX parameters for the instrument
   */
  getInstrument(index) {
    return this._data[INSTRUMENT_INDEX][index];
  }

  /**
   * Set the zzfx parameters for a instrument
   *
   * @param {Number} index The instrument to set
   * @param {Number[]} instrument ZzFX parameters for the instrument
   */
  setInstrument(index, instrument) {
    this._data[INSTRUMENT_INDEX][index] = instrument;
  }

  /**
   * Delete an instrument from a song. This will remove the indexed instrument
   * and reassign following instruments to fill the space. Instruments will be
   * also be reassigned in song patterns. If the deleted instrument is used in
   * song patterns the notes will also be deleted.
   *
   * @param {Number} index The instrument to delete
   */
  deleteInstrument(index) {
    this._data[INSTRUMENT_INDEX].splice(index, 1);

    const patternCount = this.getPatternCount();
    for (let patternIndex = 0; patternIndex < patternCount; patternIndex++) {
      const rowCount = this.getPatternRowCount(patternIndex);
      const channelCount = this.getPatternChannelCount(patternIndex);
      for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
          const instrument = this.getNoteInstrument(patternIndex, channelIndex, rowIndex);
          // if there's no instrument, bail out now
          if (!instrument) {
            continue;
          }
          // if this instrument is the one we're deleting, clear the note
          if (instrument === index + 1) {
            this.clearNote(patternIndex, channelIndex, rowIndex);
          }
          // if this instrument has a higher index than the one we're deleting
          // reassign it.
          else if (instrument > index + 1) {
            this.setNoteInstrument(patternIndex, channelIndex, rowIndex, instrument - 1);
          }
        }
      }
    }
  }

  /**
   * Set the name of an instrument. Instrument names are stored in song
   * meta data.
   *
   * @param {Number} index The instrument to set
   * @param {String} name The new instrument name
   */
  setInstrumentName(index, name) {
    let instrumentMeta = this.getMeta('instruments');
    if (!instrumentMeta) {
      instrumentMeta = [];
      this.setMeta('instruments', instrumentMeta);
    }
    instrumentMeta[index] = name;
  }

  /**
   * Gets the name of an instrument.
   *
   * @param {Number} index The instrument to get
   */
  getInstrumentName(index) {
    let instrumentMeta = this.getMeta('instruments');
    if (instrumentMeta) {
      return instrumentMeta[index];
    }
  }
/*
  getPattern(index) {
    return this._data[PATTERN_INDEX][index];
  }
*/
  /**
   * Sets the total number of patterns in the song
   *
   * @param {Number} length The new pattern count
   */
  setPatternCount(length) {
    setArrayLength(this._data[PATTERN_INDEX], length);
  }

  /**
   * Returns the total number of patterns in the song
   *
   * @returns {Number} The song pattern count
   */
  getPatternCount(length) {
    return this._data[PATTERN_INDEX].length;
  }

  /**
   * Returns the number of rows of in a pattern
   *
   * @param {Number} pattern The index of the pattern
   * @returns {Number} The number of rows in the pattern
   */
  getPatternRowCount(pattern) {
    return this._data[PATTERN_INDEX][pattern][0].length / 3 | 0;
  }

  /**
   * Sets the number of rows in a pattern. If the new length is greater than
   * the current length, empty rows will be added to each channel. If the new
   * length is shorter that the current length, remaining rows will be
   * truncated.
   *
   * @param {Number} pattern The index of the pattern
   * @param {Number} length The new row count for the pattern
   */
  setPatternRowCount(pattern, length) {
    this._data[PATTERN_INDEX][pattern].forEach((channel,i) => {
      setArrayLength(channel, length * 3, 0);
    });
  }

  /**
   * Sets the number of channels in a pattern. If the new length is greater than
   * the current length, empty channels will be added to each pattern. If the
   * new length is shorter that the current length, channels will be truncated.
   *
   * @param {Number} pattern The index of the pattern
   * @param {Number} length The new channel count for the pattern
   */
  setPatternChannelCount(pattern, count) {
    setArrayLength(this._data[PATTERN_INDEX][pattern], count);
  }


  /**
   * Returns the number of channels in a pattern.
   *
   * @param {Number} pattern The index of the pattern
   * @returns {Number} The number of channels in the pattern
   */
  getPatternChannelCount(pattern) {
    return this._data[PATTERN_INDEX][pattern].length;
  }

  /**
   * Clears the period, instrument and attenuation data for a row of a channel
   * in a pattern.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   */
  clearNote(pattern, channel, row) {
    return this.setNote(pattern, channel, row, 0, 0, 0);
  }

  /**
   * Returns the note data for a specific row of a channel in a pattern.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @returns {Number[]} Array containing note period, instrument and attentiation
   */
  getNote(pattern, channel, row) {
    return this._data[PATTERN_INDEX][pattern][channel].slice(row * 3, row * 3 + 3);
  }

  /**
   * Set the note data for a specific row of a channel in a pattern.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @param {Number} period The period of the note
   * @param {Number} instrument The instrument of the note
   * @param {Number} attenuation  The attenuation of the note
   */
  setNote(pattern, channel, row, period, instrument, attenuation = 0) {
    this.setNotePeriod(pattern, channel, row, period);
    this.setNoteInstrument(pattern, channel, row, instrument);
    this.setNoteAttenuation(pattern, channel, row, attenuation);
  }

  /**
   * Sets the note period for a specific row of a channel in a pattern without
   * modifying the instrument or attenuation.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @param {Number} period The new period for the note
   */
  setNotePeriod(pattern, channel, row, period) {
    this._data[PATTERN_INDEX][pattern][channel][row * 3 + 1] = period;
  }

  /**
   * Sets the instrument for a specific row of a channel in a pattern without
   * modifying the period or attenuation.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @param {Number} instrument The new instrument for the note
   */
  setNoteInstrument(pattern, channel, row, instrument) {
    this._data[PATTERN_INDEX][pattern][channel][row * 3] = instrument;
  }

  /**
   * Gets the instrument for a specific row of a channel in a pattern.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @returns {Number} instrument The new instrument for the note
   */
  getNoteInstrument(pattern, channel, row) {
    return this._data[PATTERN_INDEX][pattern][channel][row * 3];
  }

  /**
   * Sets the attenuation for a specific row of a channel in a pattern without
   * modifying the period or instrument.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @param {Number} instrument The new attenuation for the note
   */
  setNoteAttenuation(pattern, channel, row, attenuation) {
    this._data[PATTERN_INDEX][pattern][channel][row * 3 + 2] = attenuation;
  }

  /**
   * Gets the attenuation for a specific row of a channel in a pattern.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @returns {Number} The new attenuation for the note
   */
  getNoteAttenuation(pattern, channel, row) {
    return this._data[PATTERN_INDEX][pattern][channel][row * 3 + 2];
  }

  /**
   * Returns all the notes for a specific position in the song.
   *
   * @param {Number} position The position to retrieve notes for
   * @returns {Array[][]} Notes for the position
   */
  getNotesAtPosition(position) {
    let {pattern, row} = this.getPositionInfo(position);
    return this.getNotesAtPatternRow(pattern, row);
  }

  /**
   * Returns all the notes for a specific position in a pattern.
   *
   * @param {Number} pattern The index of the pattern containing the note s
   * @param {Number} row The row to retrieve notes for
   * @returns {Array[][]} Notes for the row
   */
  getNotesAtPatternRow(pattern, row) {
    return this._data[PATTERN_INDEX][pattern].map(channel => (channel || []).slice(row * 3,row * 3 + 3));
  }

  /**
   * @typedef {Object} PositionInfo
   * @property {Number} sequence
   * @property {Number} patternIndex
   * @property {Number} row
   */
  /**
   * Returns the sequence, pattern and row data for a song position.
   *
   * @param {Number} position The position to retrieve data for
   * @returns {PositionInfo} The position data
   */
  getPositionInfo(position) {
    let pos = 0;
    for (let sequenceIndex = 0; sequenceIndex < this._data[SEQUENCE_INDEX].length; sequenceIndex++) {
      let patternIndex = this._data[SEQUENCE_INDEX][sequenceIndex];
      let nextPos = pos + this.getPatternLength(patternIndex) - 1;
      if (nextPos >= position) {
        return {
          sequence: sequenceIndex,
          pattern: patternIndex,
          row: position - pos
        };
      }
      pos = nextPos + 1;
    }
  }

  /**
   * Gets the stereo panning position of a channel.
   *
   * @param {Number} channel The index of the channel to move
   * @returns {Number} Position between -1 (left) and 1 (right)
   */
  getChannelPanning(channel, value) {
    return this._data[PANNING_INDEX][channel];
  }

  /**
   * Set the stereo panning position of a channel.
   *
   * @param {Number} channel The index of the channel to move
   * @param {Number} value Position between -1 (left) and 1 (right)
   */
  setChannelPanning(channel, value) {
    if (!this._data[PANNING_INDEX]) {
      this._data[PANNING_INDEX] = [];
    }
    this._data[PANNING_INDEX][channel] = Math.min(1, Math.max(-1, value));
  }

  toString() {
    return encodeSong(this._data);
  }

  static fromString(str) {
    return new this(decodeSong(str));
  }
}
