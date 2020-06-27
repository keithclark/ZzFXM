/**
 * This plugin removes unnecessary repeating instruments from within a channel.
 *
 * Input:
 *
 * A-3 1 0
 * --- 0 0
 * B-3 1 0
 * --- 0 0
 *
 * Output:
 *
 * A-3 1 0
 * --- 0 0
 * B-3 0 0
 * --- 0 0
 */

/**
 * Removes instruments with a volume of 0
 * @param {ZzfxmSongFacade} facade
 */
const execute = facade => {
  const patternCount = facade.getPatternCount();

  for (let patternIndex = 0; patternIndex < patternCount; patternIndex++) {
    const patternLength = facade.getPatternRowCount(patternIndex);
    const channelCount = facade.getPatternChannelCount(patternIndex)

    for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
      let lastInstrument;
      for (let rowIndex = 0; rowIndex < patternLength; rowIndex++) {
        const instrument = facade.getNoteInstrument(patternIndex, channelIndex, rowIndex);
        if (instrument) {
          if (instrument === lastInstrument) {
            facade.setNoteInstrument(patternIndex, channelIndex, rowIndex, null);
          } else {
            lastInstrument = instrument
          }
        }
      }
    }
  }
}

export default {
  name: "Remove concurrent instrument definitions",
  execute
};
