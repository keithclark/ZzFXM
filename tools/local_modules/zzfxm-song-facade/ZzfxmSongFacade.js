import { setArrayLength } from './utils.js';
import { encodeSong, decodeSong } from './encoding.js';
import { validateInRange } from './validators.js';

const INSTRUMENT_INDEX = 0;
const PATTERN_INDEX = 1;
const SEQUENCE_INDEX = 2;
const SPEED_INDEX = 3;
const META_INDEX = 4;


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
        this._length += this.getPatternRowCount(patternIndex);
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
   * Set the pattern at a specific sequence position
   *
   * @param {Number} position The sequence position to set
   * @param {Number} new Pattern index
   */
  setSequencePattern(position, value) {
    this._data[SEQUENCE_INDEX][position] = value;
  }

  /**
   * Set the pattern at a specific sequence position
   *
   * @param {Number} position The sequence position to set
   * @param {Number} new Pattern index
   */
  deleteSequence(position) {
    this._data[SEQUENCE_INDEX].splice(position, 1)
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
   * Sets the number of instruments used in the current song
   *
   * @returns {Number} The new number of instruments
   */
  setInstrumentCount(length) {
    setArrayLength(this._data[INSTRUMENT_INDEX], length);
  }


  /**
   * Returns the zzfx parameters for an instrument.
   *
   * @param {Number} index The instrument to get
   * @returns {Number[]} ZzFX parameters for the instrument
   */
  getInstrument(index) {
    validateInRange(index, 0, this.getInstrumentCount()- 1, 'instrument');
    return this._data[INSTRUMENT_INDEX][index];
  }

  /**
   * Set the zzfx parameters for a instrument
   *
   * @param {Number} index The instrument to set
   * @param {Number[]} instrument ZzFX parameters for the instrument
   */
  setInstrument(index, instrument) {
    validateInRange(index, 0, this.getInstrumentCount()-1, 'instrument');
    this._data[INSTRUMENT_INDEX][index] = instrument;
  }

  /**
   * Delete an instrument from a song. This will remove the indexed instrument
   * and reassign following instruments to fill the space. Instruments will be
   * also be reassigned in song channels. If the deleted instrument is used in
   * song channels, the channels will also be deleted.
   *
   * @param {Number} index The instrument to delete
   */
  deleteInstrument(index) {
    validateInRange(index, 0, this.getInstrumentCount() - 1, 'instrument');

    this._data[INSTRUMENT_INDEX].splice(index, 1);

    const patternCount = this.getPatternCount();
    for (let patternIndex = 0; patternIndex < patternCount; patternIndex++) {
      const channelCount = this.getPatternChannelCount(patternIndex);
      for (let channelIndex = channelCount - 1; channelIndex >= 0; channelIndex--) {
        const instrument = this.getChannelInstrument(patternIndex, channelIndex);

        // delete the channel if it's using the instrument we're deleting
        if (instrument === index) {
          this.deleteChannel(patternIndex, channelIndex);
          // if this was the only channel in the pattern, delete the pattern
          if (channelCount === 1) {
            this.deletePattern(patternIndex);
          }
        }
        // if this instrument has a higher index than the one we're deleting
        // reassign it.
        else if (instrument > index) {
          this.setChannelInstrument(patternIndex, channelIndex, instrument - 1);
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
    validateInRange(index, 0, this.getInstrumentCount(), 'instrument');
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
    validateInRange(index, 0, this.getInstrumentCount(), 'instrument');
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
  getPatternCount() {
    return this._data[PATTERN_INDEX].length;
  }

  /**
   * Returns the number of rows of in a pattern
   *
   * @param {Number} pattern The index of the pattern
   * @returns {Number} The number of rows in the pattern
   */
  getPatternRowCount(pattern) {
    return this._data[PATTERN_INDEX][pattern][0].length - 2;
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
      setArrayLength(channel, length + 2, 0);
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
    this.setPatternRowCount(pattern, this.getPatternRowCount(pattern));
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
   * Deletes a pattern from a song.
   *
   * @param {*} pattern
   */
  deletePattern(pattern) {
    const sequenceCount = this.getSequenceLength();
    this._data[PATTERN_INDEX].splice(pattern, 1);

    for (let sequenceIndex = sequenceCount - 1; sequenceIndex >= 0; sequenceIndex--) {
      const sequencePattern = this.getSequencePattern(sequenceIndex);
      if (sequencePattern === pattern) {
        this.deleteSequence(sequenceIndex);
      } else if (sequencePattern > pattern) {
        this.setSequencePattern(sequenceIndex, sequencePattern - 1);
      }
    }
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
    return this.setNote(pattern, channel, row, 0, 0);
  }

  /**
   * Returns the note data for a specific row of a channel in a pattern.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @returns {Number} Array containing note period, instrument and attentiation
   */
  getNote(pattern, channel, row) {
    return this._data[PATTERN_INDEX][pattern][channel][row + 2];
  }

  /**
   * Set the note data for a specific row of a channel in a pattern.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @param {Number} period The period of the note
   * @param {Number} attenuation  The attenuation of the note
   */
  setNote(pattern, channel, row, period, attenuation = 0) {
    this.setNotePeriod(pattern, channel, row, period);
    this.setNoteAttenuation(pattern, channel, row, attenuation);
  }


  /**
   * Gets the note period for a specific row of a channel in a pattern.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @returns {Number} period The new period for the note
   */
  getNotePeriod(pattern, channel, row) {
    return this.getNote(pattern, channel, row) | 0;
  }

  /**
   * Sets the note period for a specific row of a channel in a pattern without
   * modifying the attenuation.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @param {Number} period The new period for the note
   */
  setNotePeriod(pattern, channel, row, period) {
    this._data[PATTERN_INDEX][pattern][channel][row + 2] = period | 0;
  }

  /**
   * Sets the attenuation for a specific row of a channel in a pattern without
   * modifying the period.
   *
   * @param {Number} pattern The index of the pattern containing the note
   * @param {Number} channel The index of the chanel containing the note
   * @param {Number} row The index of the row containing the note
   * @param {Number} attenuation The new attenuation for the note
   */
  setNoteAttenuation(pattern, channel, row, attenuation) {
    const period = this.getNotePeriod(pattern,channel,row);
    this._data[PATTERN_INDEX][pattern][channel][row + 2] = period + (attenuation % 1);
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
    return this.getNote(pattern, channel, row) % 1;
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
    return this._data[PATTERN_INDEX][pattern].map(channel => (channel || []).slice(row + 2, row + 3));
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
      let nextPos = pos + this.getPatternRowCount(patternIndex) - 1;
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
   * @param {Number} pattern The index of the pattern containing the channel
   * @param {Number} channel The index of the channel
   * @returns {Number} Position between -1 (left) and 1 (right)
   */
  getChannelPanning(pattern, channel, value) {
    return this._data[PATTERN_INDEX][pattern][channel][1];
  }

  /**
   * Set the stereo panning position of a channel.
   *
   * @param {Number} pattern The index of the pattern containing the channel
   * @param {Number} channel The index of the channel
   * @param {Number} value Position between -1 (left) and 1 (right)
   */
  setChannelPanning(pattern, channel, value) {
    this._data[PATTERN_INDEX][pattern][channel][1] = Math.min(1, Math.max(-1, value));
  }

  /**
   * Get the instrument of a channel.
   *
   * @param {Number} pattern The index of the pattern containing the channel
   * @param {Number} channel The index of the channel
   * @returns {Number} Instrument number
   */
  getChannelInstrument(pattern, channel) {
    return this._data[PATTERN_INDEX][pattern][channel][0];
  }

  /**
   * Set the instrument of a channel.
   *
   * @param {Number} pattern The index of the pattern containing the channel
   * @param {Number} channel The index of the channel
   * @param {Number} value Instrument number
   */
  setChannelInstrument(pattern, channel, value) {
    return this._data[PATTERN_INDEX][pattern][channel][0] = value;
  }

  /**
   * Delete a channel from a pattern
   *
   * @param {Number} pattern The index of the pattern containing the channel
   * @param {Number} channel The index of the channel
   */
  deleteChannel(pattern, channel) {
    this._data[PATTERN_INDEX][pattern].splice(channel, 1);
  }

  toString() {
    return encodeSong(this._data);
  }

  static fromString(str) {
    return new this(decodeSong(str));
  }
}
