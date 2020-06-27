# ZzFXM Song Compression Module

Use this module for packing ZzFXM song data in applications.

```js
import { packSong } from 'zzfxm-song-compressor';
import mySong from 'path/to/song.js';

console.log(packSong(mySong, {options}));
```

## Plugins

You can extend the compressor by writing plugins. A plugin is a JavaScript module that executes code on a `ZzfxmSongFacade` instance. Plugins mutate the song data through the facade.

A basic plugin has an `execute` method and a human-friendly `name` property, which can be used in reports. Plugins can also return a `postProcess` method, which will be called after the song has been processed by every plugin. `postProcess` is called with a stringified version of the compressed song.

```js
/**
 * An example plugin for removing song meta data
 */

const execute = (facade) => {
  facade.clearMeta()
}

// Add a comment to the generated output
const postProcess = (songString) => `/* Hai! */\n${songString}`;

// export the plugin
export default {
  name: "Remove all song metadata",
  execute,
  postProcess
};
```
