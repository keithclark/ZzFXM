/**
 * This plugin removes empty channels from the right side of a song pattern.
 * Empty channels between populated channels are kept to preserve stereo panning
 * and sustained notes.
 *
 * Input:
 *
 * A-3 1 0  |  --- 0 0  |  C-3 1 0  |  --- 0 0
 * --- 0 0  |  --- 0 0  |  --- 0 0  |  --- 0 0
 * B-3 1 0  |  --- 0 0  |  A-3 1 0  |  --- 0 0
 * --- 0 0  |  --- 0 0  |  --- 0 0  |  --- 0 0
 *
 * Output:
 *
 * A-3 1 0  |  --- 0 0  |  C-3 1 0
 * --- 0 0  |  --- 0 0  |  --- 0 0
 * B-3 1 0  |  --- 0 0  |  A-3 1 0
 * --- 0 0  |  --- 0 0  |  --- 0 0
 */

/**
 * Removes empty channels from the end of patterns.
 * @param {ZzfxmSongFacade} facade
 */
const execute = facade => {
  const patternCount = facade.getPatternCount();

  for (let patternIndex = 0; patternIndex < patternCount; patternIndex++) {
    const patternLength = facade.getPatternRowCount(patternIndex);
    const channelCount = facade.getPatternChannelCount(patternIndex);
    let empty = true;
    for (let channelIndex = channelCount-1; channelIndex >= 0; channelIndex--) {
      for (let rowIndex = 0; rowIndex < patternLength; rowIndex++) {
        const note = facade.getNote(patternIndex, channelIndex, rowIndex);
        const [instrument, period, attenuation] = note;
        if (instrument || period || attenuation) {
          empty = false;
          break;
        }
      }
      if (empty) {
        facade.setPatternChannelCount(patternIndex, channelIndex)
      } else {
        break;
      }
    }
  }
}

export default {
  name: "Trim empty trailing channels from patterns",
  execute
};
