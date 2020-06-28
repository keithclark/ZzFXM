import cli from 'cli';
import { packSong } from 'zzfxm-song-compressor';
import { promises } from 'fs';
import { ZzfxmSongFacade } from '../local_modules/zzfxm-song-facade/ZzfxmSongFacade.js';
import { deflate } from 'zlib';
import { resolve, dirname} from 'path';
import { fileURLToPath } from 'url';

const { readFile, writeFile } = promises;


const options = cli({
  name: 'ZzFXM Song Packing Tool',
  packageJson: resolve(dirname(fileURLToPath(import.meta.url)), 'package.json'),
  inputPaths: 'single',
  outputPath: 'optional',
  options: [
    { name: 'encode', type: Boolean, description: "Encode the pattern data as strings"},
    { name: 'keep-slient-instruments', type: Boolean, description: "Don't remove any slient instruments (and notes using them) from the song"},
    { name: 'keep-concurrent-instruments', type: Boolean, description: "Don't remove unnecessary repeated instrument codes from channel data"},
    { name: 'keep-metadata', type: Boolean, description: "Don't remove song metadata" },
    { name: 'keep-empty-channels', type: Boolean, description: "Don't trim empty trailing channels from song patterns'"},
  ]
});


const getZippedSize = buffer => new Promise((resolve, reject) => {
  deflate(buffer, (err, buffer) => {
    if (err) {
      reject(err);
    } else {
      resolve(buffer.length);
    }
  });
});

const processFile = async (src, dest, options) => {
  let buffer = await readFile(src);
  buffer = buffer.toString();
  buffer = buffer.replace(/\/\*[\w\W]+?\*\//g, '');
  buffer = buffer.replace(/export\s+default\s+/g, '');
  buffer = buffer.replace(/;$/m, '');
  buffer = buffer.trim();

  const song = ZzfxmSongFacade.fromString(buffer);

  const packed = packSong(song, options, pluginResult => {
    const inputSize = pluginResult.input.length;
    const outputSize = pluginResult.output.length;
    const message = `- ${pluginResult.name}: ${inputSize} -> ${outputSize}`;
    if (outputSize < inputSize) {
      console.log((message));
    } else if (outputSize > inputSize) {
      console.log((message));
    } else {
      console.log(message);
    }
  });
  const gzippedBefore = await getZippedSize(buffer);
  const gzippedAfter = await getZippedSize(packed);

  console.log(`\nOriginal size: ${buffer.length} (${gzippedBefore} gzipped)`);
  console.log(`Packed size: ${packed.length} (${gzippedAfter} gzipped)`);

  await writeFile(dest, `export default ${packed}`);
  console.log(`\nFile "${dest}" written successfully.`);
};


const process = async options => {
  const src = options.paths[0];
  const dest = options.paths[1] || 'packed.js';

  await processFile(src, dest, {
    removeSilentInstruments: !options.keepSlientInstruments,
    removeConcurrentInstruments: !options.keepConcurrentInstruments,
    trimEmptyChannels: !options.keepEmptyChannels,
    removeMetadata: !options.keepMetadata,
    encodePatternData: !!options.encode
  });
};

process(options);
