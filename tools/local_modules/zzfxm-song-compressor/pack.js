import removeConcurrentInstruments from './plugins/removeConcurrentInstruments.js';
import trimEmptyChannels from './plugins/trimEmptyChannels.js';
import removeMetadata from './plugins/removeMetadata.js';
import encodePatternData from './plugins/encodePatternData.js';
import removeSilentInstruments from './plugins/removeSilentInstruments.js';


const getPluginList = options => {
  const plugins = [];
  if (options.removeSilentInstruments) {
    plugins.push(removeSilentInstruments);
  }
  if (options.removeConcurrentInstruments) {
    plugins.push(removeConcurrentInstruments);
  }
  if (options.trimEmptyChannels) {
    plugins.push(trimEmptyChannels);
  }
  if (options.removeMetadata) {
    plugins.push(removeMetadata);
  }
  if (options.encodePatternData) {
    plugins.push(encodePatternData);
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
