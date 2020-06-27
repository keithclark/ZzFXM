/**
 * This plugin removes the human-readable meta data from songs
 */

/**
 * Removes song metadata
 * @param {ZzfxmSongFacade} facade
 */

const execute = facade => {
  facade.clearMeta()
}

export default {
  name: "Remove all song metadata",
  execute
};
