/**
 * This plugin removes patterns that aren't used in the song.
 */

/**
 * Removes unused patterns
 * @param {ZzfxmSongFacade} facade
 */
const execute = facade => {

  const patternCount = facade.getPatternCount();
  const sequenceLength = facade.getSequenceLength();
  const sequence = [];

  for (let sequenceIndex = sequenceLength - 1; sequenceIndex >= 0; sequenceIndex--) {
    const pattern = facade.getSequencePattern(sequenceIndex);
    if (!sequence.includes(pattern)) {
      sequence.push(pattern);
    }
  }

  for (let patternIndex = patternCount - 1; patternIndex >= 0; patternIndex--) {
    if (!sequence.includes(patternIndex)) {
      facade.deletePattern(patternIndex);
    }
  }
};

export default {
  name: "Remove unused patterns",
  execute
};
