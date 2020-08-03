import removeMetadata from './plugins/removeMetadata.js';
import removeSilentInstruments from './plugins/removeSilentInstruments.js';
import convertChannelsToLookups from './plugins/convertChannelsToLookups.js';
import removeUnusedPatterns from './plugins/removeUnusedPatterns.js';
import removeUnusedInstruments from './plugins/removeUnusedInstruments.js';


const getPluginList = options => {
  const plugins = [];

  if (options.removeSilentInstruments) {
    plugins.push(removeSilentInstruments);
  }
  if (options.removeUnusedPatterns) {
    plugins.push(removeUnusedPatterns);
  }
  if (options.removeUnusedInstruments) {
    plugins.push(removeUnusedInstruments);
  }
  if (options.removeMetadata) {
    plugins.push(removeMetadata);
  }
  if (options.convertChannelsToLookups) {
    plugins.push(convertChannelsToLookups);
  }
  return plugins;
}


export const packSong = (song, options, callback) => {

  const plugins = getPluginList(options);

  plugins.forEach(plugin => {
    const input = song.toString();
    plugin.execute(song);
    let output = song.toString();
    if (callback) {
      callback({
        name: plugin.name,
        input,
        output
      });
    }
  });

  song = song.toString();

  plugins.filter(plugin => !!plugin.postProcess).forEach(plugin => {
    song = plugin.postProcess(song);
  });

  return song;
}
