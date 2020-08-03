/**
 * This plugin converts channel data into lookup tables.
 */
const channelTable = [];

/**
 * Replaces channel data with indexed lookups
 *
 * @param {ZzfxmSongFacade} facade
 */
const execute = facade => {
  const patternCount = facade.getPatternCount();

  for (let patternIndex = 0; patternIndex < patternCount; patternIndex++) {
    const patternLength = facade.getPatternRowCount(patternIndex);
    const channelCount = facade.getPatternChannelCount(patternIndex)

    for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
      const channelData = []
      channelData.push(facade.getChannelInstrument(patternIndex, channelIndex));
      channelData.push(facade.getChannelPanning(patternIndex, channelIndex));
      for (let rowIndex = 0; rowIndex < patternLength; rowIndex++) {
        channelData.push(facade.getNote(patternIndex, channelIndex, rowIndex));
      }
      let channelKey = channelData.flat().toString();
      let channelIdx = channelTable.indexOf(channelKey);
      if (channelIdx === -1) {
        channelIdx = channelTable.push(channelKey);
      }
      facade._data[1][patternIndex][channelIndex] = channelIdx;
    }
  }
}

const postProcess = songString => {
  return songString.replace(/(\],\[\[.*\]\])/, `$1.map(x=>x.map(x=>[[${channelTable.join('],[')}]][x-1]))`);
}

export default {
  name: "Convert channels to lookups",
  execute,
  postProcess
};
