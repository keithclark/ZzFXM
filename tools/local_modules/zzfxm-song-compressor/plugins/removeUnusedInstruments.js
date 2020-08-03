/**
 * This plugin removes all instruments that aren't used in the song.
 */

/**
 * Removes unused instruments
 * @param {ZzfxmSongFacade} facade
 */
const execute = facade => {

  const patternCount = facade.getPatternCount();
  const instrumentCount = facade.getInstrumentCount();
  const instruments = [];

  for (let patternIndex = patternCount - 1; patternIndex >= 0; patternIndex--) {
    const channelCount = facade.getPatternChannelCount(patternIndex);
    for (let channelIndex = channelCount - 1; channelIndex >= 0; channelIndex--) {
      const instrument = facade.getChannelInstrument(patternIndex, channelIndex);
      if (!instruments.includes(instrument)) {
        instruments.push(instrument);
      }
    }
  }

  for (let instrumentIndex = instrumentCount - 1; instrumentIndex > 0; instrumentIndex--) {
    if (!instruments.includes(instrumentIndex)) {
      facade.deleteInstrument(instrumentIndex);
    }
  }
};

export default {
  name: "Remove unused instruments",
  execute
};
