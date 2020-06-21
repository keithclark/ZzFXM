import { setArrayLength } from './utils.js';
import { encodeSong } from './encoding.js';


export class ZzfxmSongFacade {

  constructor(data = [[],[],[], 6]) {
    this._data = data;
  }

  /**
   * Set song meta data
   *
   * @param {String} key Name of the property to set
   * @param {*} value New value of the property to set
   */
  setMeta(name, value) {
    if (!this._data[4]) {
      this._data[4] = {};
    }
    this._data[4][name] = value;
  }

  /**
   * Return song meta data
   *
   * @param {String} key Name of the property to get
   * @returns {*} New value of the property or null if it doesn't exist
   */
  getMeta(name) {
    if (this._data[4]) {
      return this._data[4][name];
    } else {
      return null;
    }
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
    return this._data[3];
  }

  set speed(value) {
    this._data[3] = value;
  }


  /**
   * Get the pattern at a specific sequence position
   *
   * @param {Number} position The sequence position to get
   * @returns {Number} The pattern index at the position
   */
  getSequence(position) {
    return this._data[2][position];
  }

  /**
   * Get the pattern at a specific sequence position
   *
   * @param {Number} position The sequence position to set
   * @param {Number} new Pattern index
   */
  setSequence(position, value) {
    this._data[2][position] = value;
  }

  /**
   * Set the zzfx parameters for a instrument
   *
   * @param {Number} index The instrument to set
   * @param {Number[]} instrument ZzFX parameters for the instrument
   */
  setInstrument(index, instrument) {
    this._data[0][index] = instrument;
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

  /**
   * Sets the total number of patterns in the song
   *
   * @param {Number} length The new pattern count
   */
  setPatternCount(length) {
    setArrayLength(this._data[1], length);
  }

  /**
   * Returns the total number of patterns in the song
   *
   * @returns {Number} The song pattern count
   */
  getPatternCount(length) {
    return this._data[1].length;
  }

  /**
   * Returns the number of rows of in a pattern
   *
   * @param {Number} pattern The index of the pattern
   * @returns {Number} The number of rows in the pattern
   */
  getPatternLength(pattern) {
    return this._data[1][pattern][0].length / 3;
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
  setPatternLength(pattern, length) {
    this._data[1][pattern].forEach((channel,i) => {
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
    setArrayLength(this._data[1][pattern], count);
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
    return this._data[1][pattern][channel].slice(row * 3, row * 3 + 3);
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
    this._data[1][pattern][channel][row * 3 + 1] = period;
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
    this._data[1][pattern][channel][row * 3] = instrument;
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
    this._data[1][pattern][channel][row * 3 + 2] = attenuation;
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
    return this._data[1][pattern].map(channel => channel.slice(row * 3,row * 3 + 3));
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
    for (let sequenceIndex = 0; sequenceIndex < this._data[2].length; sequenceIndex++) {
      let patternIndex = this._data[2][sequenceIndex];
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

  toString() {
    return encodeSong(this._data);
  }
}
