import cli from 'cli';
import { convertSong } from './convert.js';
import { promises } from 'fs';
import { prettyPrint} from './lib/prettyPrint.js';
import { resolve, dirname} from 'path';
import { fileURLToPath } from 'url';

const { readFile, writeFile } = promises;

let options = cli({
  name: 'ZzFXM Song Conversion Tool',
  packageJson: resolve(dirname(fileURLToPath(import.meta.url)), 'package.json'),
  inputPaths: 'single',
  outputPath: 'optional',
  options: [
    { name: 'ignore-errors', alias: 'i', type: Boolean, description: 'Ignore incompatability errors with ZzxFM and the source song.' },
    { name: 'no-instruments', alias: 'n', type: Boolean, description: 'Don\'t generate instrument data.'},
    { name: 'sane-instruments', alias: 's', type: Boolean, description: 'Only generate data for known instruments.'},
    { name: 'pretty-print', alias: 'p', type: Boolean, description: 'Generate human-readable output file.'},
    { name: 'format', alias: 'f', values: ['none', 'esm'], type: String, description: `Output format.`, defaultValue: 'none'},
  ]
});

const run = async (options) => {
  const buffer = await readFile(options.paths[0]);
  const { song, warnings } = convertSong(buffer, options);
  const assignedInstruments = []
  const unassignedInstruments = []
  const instrumentNames = [];

  let instrumentCount = song.getInstrumentCount();

  for (let i = 0; i <= instrumentCount - 1; i++) {
    instrumentNames.push(song.getInstrumentName(i));
    if (!song.getInstrument(i).length || song.getInstrument(i)[0] === 0) {
      unassignedInstruments.push(song.getInstrumentName(i))
    } else {
      assignedInstruments.push(song.getInstrumentName(i))
    }
  }

  console.log(`- Converted "${song.title}"`);
  console.log(`  • Sequence length: ${song.getSequenceLength()}`);
  console.log(`  • Instruments: ${song.getInstrumentCount()}`);
  console.log(`  • Patterns: ${song.getPatternCount()}`);
  console.log(`  • Speed: ${song.speed} BPM`);

  if (assignedInstruments.length) {
    console.log(`- Created ${assignedInstruments.length} ZzFX instruments`);
  }

  if (unassignedInstruments.length) {
    console.log(`- Created ${unassignedInstruments.length} empty instruments`);
  }

  if (warnings.length) {
    console.log();
    console.log(`WARNING: Conversion completed without error but you should be aware of the following, which could impact fidelity:`);
    warnings.map(warning => console.log(`  • ${warning}`))
  }

  let dest;
  if (options.paths[1]) {
    dest = options.paths[1];
  } else if (song.title) {
    dest = `${song.title}.js`;
  } else {
    dest = 'song.js';
  }

  let code = song.toString();
  if (options.prettyPrint) {
    code = prettyPrint(code, instrumentNames);
  }

  if (options.format === 'esm') {
    code = `export default ${code};`;
  }

  await writeFile(dest, code);
  console.log(`\nFile "${dest}" written successfully.`);
}


run(options).catch(e => {
  let {message, code} = e;
  if (code == 'ENOENT') {
    message = `File '${e.path}' not found.`;
  }
  if (code == 'ERR_ZZFXM_NO_SUPPORT') {
    message = `${e.message}. Try again with the -i argument to ignore errors.`;
  }
  console.log(message);
});
