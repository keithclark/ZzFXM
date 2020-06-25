import commandLineUsage from 'command-line-usage';
import commandLineArgs from 'command-line-args';
import { convertSong } from './convert.js';
import { promises } from 'fs';

let options;

const {readFile, writeFile} = promises;

const argOptions = [
  { name: 'src', type: String, multiple: false, defaultOption: true, description: 'The source file to convert' },
  { name: 'out', type: String, multiple: false, description: 'The destination file' },
  { name: 'ignore-errors', alias: 'i', type: Boolean, description: 'Ignore incompatability errors with ZzxFM and the source song.' },
  { name: 'no-instruments', alias: 'n', type: Boolean, description: 'Don\'t generate instrument data.'},
  { name: 'sane-instruments', alias: 's', type: Boolean, description: 'Only generate data for known instruments.'},
  { name: 'pretty-print', alias: 'p', type: Boolean, description: 'Generate human-readable output file.'},
]

const commandLineHeader = 'ZzFXM Song Convertion Tool';

const usage = commandLineUsage([
  {
    header: commandLineHeader,
    content: 'Generates ZzFXM song data from other formats.'
  },
  {
    header: 'Options',
    optionList: argOptions
  }
]);


const process = async () => {
  let buffer = await readFile(options.src);
  let song = convertSong(buffer, options);
  const assignedInstruments = []
  const unassignedInstruments = []

  let instrumentCount = song.getInstrumentCount();

   for (let i=0; i<instrumentCount;i++) {
    if (song.getInstrument(i)[0] === 0) {
      unassignedInstruments.push(song.getInstrumentName(i))
    } else {
      assignedInstruments.push(song.getInstrumentName(i))
    }
  }

  console.log(`- Converted "${song.title}"`);
  console.log(`  • Sequence length: ${song.getSequenceLength()}`);
  console.log(`  • Instruments: ${song.getInstrumentCount()}`);
  console.log(`  • Patterns: ${song.getPatternCount()}`);
  console.log(`- Created ${assignedInstruments.length} zzfx instruments:`);
  console.log(`  • ${assignedInstruments.join(', ')}`);
  console.log(`- Created ${unassignedInstruments.length} empty instruments`);
  console.log(`  • ${unassignedInstruments.join(', ')}`);


  let file;
  if (options.out) {
    file = options.out;
  } else if (song.title) {
    file = `${song.title}.js`;
  } else {
    file = 'song.js';
  }
  await writeFile(file, `export default ${song.toString()}`);
  console.log(`\nFile "${file}" written successfully.`);
}


try {
  options = commandLineArgs(argOptions, { camelCase: true });
  if (options.help) {
    console.log(usage);
  } else {
    if (!options.src) {
      throw new Error('Source file is required');
    }
    console.log(commandLineUsage([{header: commandLineHeader}]));
    process();
  }
} catch (e) {
  console.log(e.message);
  console.log(usage);
}
