import commandLineUsage from 'command-line-usage';
import commandLineArgs from 'command-line-args';
import { convertSong } from './convert.js';
import { promises } from 'fs';
import { prettyPrint} from './lib/prettyPrint.js';
import { exit } from 'process';

let options;

const {readFile, writeFile} = promises;

const OUTPUT_FORMAT_OPTIONS = [
  'none',
  'esm'
];

const argOptions = [
  { name: 'files', type: String, multiple: true, defaultOption: true},
  { name: 'ignore-errors', alias: 'i', type: Boolean, description: 'Ignore incompatability errors with ZzxFM and the source song.' },
  { name: 'no-instruments', alias: 'n', type: Boolean, description: 'Don\'t generate instrument data.'},
  { name: 'sane-instruments', alias: 's', type: Boolean, description: 'Only generate data for known instruments.'},
  { name: 'pretty-print', alias: 'p', type: Boolean, description: 'Generate human-readable output file.'},
  { name: 'format', alias: 'f', type: String, description: `Output format (${OUTPUT_FORMAT_OPTIONS.join(', ')}). Default: none`, defaultValue: 'none'},
  { name: 'help', type: Boolean, description: "Show this help"},
];

const commandLineHeader = 'ZzFXM Song Convertion Tool';

const usage = commandLineUsage([
  {
    header: commandLineHeader,
    content: 'Generates ZzFXM song data from other formats.'
  },
  {
    header: 'Synopsis',
    content: '$ zzfxm-convert {underline input-path} [{underline output-path}] [options]'
  },
  {
    header: 'Options',
    hide: ['files'],
    optionList: argOptions
  }
]);


const process = async (options) => {
  let buffer = await readFile(options.files[0]);
  let song = convertSong(buffer, options);
  const assignedInstruments = []
  const unassignedInstruments = []
  const instrumentNames = [];

  let instrumentCount = song.getInstrumentCount();

   for (let i=0; i<instrumentCount;i++) {
    instrumentNames.push(song.getInstrumentName(i));
    if (!song.getInstrument(i).length || !song.getInstrument(i)[0] === 0) {
      unassignedInstruments.push(song.getInstrumentName(i))
    } else {
      assignedInstruments.push(song.getInstrumentName(i))
    }
  }

  console.log(`- Converted "${song.title}"`);
  console.log(`  • Sequence length: ${song.getSequenceLength()}`);
  console.log(`  • Instruments: ${song.getInstrumentCount()}`);
  console.log(`  • Patterns: ${song.getPatternCount()}`);

  if (assignedInstruments.length) {
    console.log(`- Created ${assignedInstruments.length} zzfx instruments:`);
    console.log(`  • ${assignedInstruments.join(', ')}`);
  }

  if (unassignedInstruments.length) {
    console.log(`- Created ${unassignedInstruments.length} empty instruments`);
    console.log(`  • ${unassignedInstruments.join(', ')}`);
  }

  let dest;
  if (options.files[1]) {
    dest = options.files[1];
  } else if (song.title) {
    dest = `${song.title}.js`
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


try {
  options = commandLineArgs(argOptions, { camelCase: true });
  if (options.help) {
    console.log(usage);
    exit();
  }

  if (!OUTPUT_FORMAT_OPTIONS.includes(options.format)) {
    throw new Error('Invalid output format');
  }
  if (!options.files) {
    throw new Error('Source file is required.');
  }
  if (options.files.length > 2) {
    throw new Error('Too many files specified.');
  }

  console.log(commandLineUsage([{header: commandLineHeader}]));
  process(options);
} catch (e) {
  console.error(e.message);
}
