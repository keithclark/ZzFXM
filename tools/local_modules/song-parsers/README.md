# Song Parsers

A collection of parsers for various song formats.

```js
import { promises } from 'fs';
import { parseProtracker } from 'song-parsers';

const {readFile, writeFile} = promises;

// Read the binary data
const buffer = await readFile('./path/to/song.mod');

// Use the protracker parser to read the file
parseProtracker(buffer, token => {
  if (token.type === 'title') {
    console.log(`This song is titled "${token.value}"`);
  }
});
```

