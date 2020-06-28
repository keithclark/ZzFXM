import commandLineUsage from 'command-line-usage';
import commandLineArgs from 'command-line-args';
import { resolve, parse } from 'path';
import { createRequire } from 'module';


export default (config = {}) => {

  const reportError = message => {
    console.log(commandLineUsage({header: appName}));
    console.error(`Error: ${message}`);
    process.exit();
  };

  let appName;
  let appDescription;
  let appBinary = parse(process.argv[1]).name;
  let appVersion;
  let options;

  if (config.packageJson) {
    const require = createRequire(import.meta.url);
    const packageJson = require(resolve(process.argv[1], config.packageJson));
    appName = packageJson.name;
    appDescription = packageJson.description;
    appVersion = packageJson.version;
  }

  if (config.name) {
    appName = config.name;
  }

  const argOptions = config.options ? config.options.slice() : [];

  argOptions.push({name: 'help', type: Boolean, description: "Show this help"});
  argOptions.push({name: 'version', alias: 'v', type: Boolean, description: "Show version"});

  if (config.inputPaths || config.outputPath) {
    argOptions.push({name: 'paths', type: String, multiple: true, defaultOption: true, defaultValue: []});
  }

  try {
    options = commandLineArgs(argOptions, { camelCase: true });
  } catch (e) {
    reportError(e.message);
  }

  if (options.version) {
    console.log(`v${appVersion}`);
    process.exit();
  }

  if (options.help) {
    const usage = [];

    if (appName) {
      usage.push({
        header: appName,
        content: appDescription
      });
    }

    if (appBinary) {
      const synopsis = [];
      synopsis.push(appBinary);

      if (config.inputPaths) {
        if (config.inputPaths === 'single') {
          synopsis.push('{underline input-path}');
        }
      }

      if (config.outputPath) {
        if (config.outputPath === 'optional') {
          synopsis.push('[{underline output-path}]');
        } else {
          synopsis.push('{underline output-path}');
        }
      }

      usage.push({
        header: 'Synopsis',
        content: `$ ${synopsis.join(' ')} [options]`
      });
    }

    usage.push({
      header: 'Options',
      hide: ['paths'],
      optionList: argOptions
    });

    console.log(commandLineUsage(usage));
    process.exit();
  }

  // Validate the input/output paths are correctly configured
  if (config.inputPaths || config.outputPath) {
    let minPaths = 0;
    let maxPaths = 0;

    if (config.inputPaths) {
      if (config.inputPaths === 'single') {
        minPaths++;
        maxPaths++;
      } else if (config.inputPaths === 'multiple') {
        maxPaths = 10;
      } else if (config.inputPaths !== 'none') {
        reportError('Invalid value for "inputPaths"');
      }
    }

    if (config.outputPath) {
      if (config.outputPath === 'required') {
        minPaths++;
        maxPaths++;
      } else if (config.outputPath === 'optional') {
        if (config.inputPaths === 'multiple') {
          reportError('"outputPath" cannot be optional when "inputPaths" is set to multiple');
        }
        maxPaths++;
      } else if (config.outputPath !== 'none') {
        reportError('Invalid value for "outputPath"');
      }
    }

    if (options.paths.length < minPaths || options.paths.length > maxPaths) {
      console.error('Invalid number of file paths');
      process.exit();
    }
  }


  // Validate required options exist
  argOptions.forEach(argOption => {
    const {name} = argOption;
    const value = options[name]
    if (argOption.required === true && (value === undefined || value === null)) {
      reportError(`Option "${name}" is required.`);
    }
  });


  // Validate options with values
  argOptions.forEach(argOption => {
    if (argOption.values) {
      const {name} = argOption;
      const value = options[name];
      if (value && !argOption.values.includes(value)) {
        reportError(`Invalid value "${value}" for option "${name}"`);
      }
    }
  });

  // Output the header
  console.log(commandLineUsage({
    header: appName
  }));

  return options;
}
