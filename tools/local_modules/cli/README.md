## CLI Module

Use this module for working with arguments when creating CLI applications.

## Example

```js
import cli from 'cli';

const options = cli({
  name: 'ZzFXM Song Packing Tool',
  packageJson: 'absolute/path/to/package.json',
  inputPaths: 'single',
  outputPath: 'optional',
  options: [
    { name: 'encode', type: Boolean, description: "Encode the pattern data as strings"},
    { name: 'keep-slient-instruments', type: Boolean, description: "Don't remove any slient instruments (and notes using them) from the song"},
    { name: 'keep-concurrent-instruments', type: Boolean, description: "Don't remove unnecessary repeated instrument codes from channel data"},
    { name: 'keep-metadata', type: Boolean, description: "Don't remove song metadata" },
    { name: 'keep-empty-channels', type: Boolean, description: "Don't trim empty trailing channels from song patterns'"},
    { name: 'format', type: String, values: ['esm', 'cjs'], required: true, description: "Output format"}
  ]
});
```
