/**
 * This plugin removes instruments with zero volume. These can be added by the
 * song conversion tool or be edited out. Notes using the instruments are also
 * removed.
 */

/**
 * Removes instruments with a volume of 0
 * @param {ZzfxmSongFacade} facade
 */
const execute = facade => {

  const instrumentCount = facade.getInstrumentCount()

  for (let instrumentIndex = instrumentCount - 1; instrumentIndex >= 0; instrumentIndex--) {
    if (facade.getInstrument(instrumentIndex)[0] === 0) {
      facade.deleteInstrument(instrumentIndex);
    }
  }
}

export default {
  name: "Remove instruments with zero-volume",
  execute
};
