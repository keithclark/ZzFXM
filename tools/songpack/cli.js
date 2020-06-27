import commandLineUsage from 'command-line-usage';
import commandLineArgs from 'command-line-args';
import { packSong } from 'zzfxm-song-compressor';
import { promises } from 'fs';
import { ZzfxmSongFacade } from '../local_modules/zzfxm-song-facade/ZzfxmSongFacade.js';
import { deflate } from 'zlib';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const chalk = require('chalk');

const {readFile, writeFile} = promises;

const commandLineHeader = 'ZzFXM Song Packing Tool';

const argOptions = [
  { name: 'files', type: String, multiple: true, defaultOption: true, description: 'The source file to compress and optional output file'},
  { name: 'help', type: Boolean, description: "Show this help"},
  { name: 'encode', type: Boolean, description: "Encode the pattern data as strings"},
  { name: 'keep-slient-instruments', type: Boolean, description: "Don't remove any slient instruments (and notes using them) from the song"},
  { name: 'keep-concurrent-instruments', type: Boolean, description: "Don't remove unnecessary repeated instrument codes from channel data"},
  { name: 'keep-metadata', type: Boolean, description: "Don't remove song metadata" },
  { name: 'keep-empty-channels', type: Boolean, description: "Don't trim empty trailing channels from song patterns'"},
];

const usage = commandLineUsage([
  {
    header: commandLineHeader,
    content: 'Compresses ZzFXM song data'
  },
  {
    header: 'Synopsis',
    content: '$ zzfxm-songpack {underline input-path} [{underline output-path}] [options]'
  },
  {
    header: 'Options',
    hide: ['files'],
    optionList: argOptions
  },
  {
    header: 'Examples',
    content: '$ zzfxm-songpack my-song.js my-packed-song.js --encode'
  },
]);

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

  console.log(commandLineUsage([{header: commandLineHeader}]));

  const packed = packSong(song, options, pluginResult => {
    const inputSize = pluginResult.input.length;
    const outputSize = pluginResult.output.length;
    const message = `- ${pluginResult.name}: ${inputSize} -> ${outputSize}`;
    if (outputSize < inputSize) {
      console.log(chalk.green(message));
    } else if (outputSize > inputSize) {
      console.log(chalk.red(message));
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
}

const process = async argOptions => {
  const options = commandLineArgs(argOptions, { camelCase: true });

  if (options.help) {
    console.log(usage);
    return;
  }

  if (!options.files) {
    throw new Error('Source file is required.');
  }

  if (options.files.length > 2) {
    throw new Error('Too many files specified.');
  }

  const src = options.files[0];
  const dest = options.files[1] || 'packed.js';

  await processFile(src, dest, {
    removeSilentInstruments: !options.keepSlientInstruments,
    removeConcurrentInstruments: !options.keepConcurrentInstruments,
    trimEmptyChannels: !options.keepEmptyChannels,
    removeMetadata: !options.keepMetadata,
    encodePatternData: !!options.encode
  });
}


process(argOptions).catch(e => {
  console.error(`${e.message} - Please use --help for more information.`);
});
