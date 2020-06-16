# ZzFXM Song Facade

The song facade provides a simple interface for working with ZzFXM songs. Use of this is facade is recommended when developing tools for ZzFXM because it should make tooling resilient to minor format changes.

The facade mutates the data for the song it's acting on.

```js
import { ZzfxmSongFacade } from 'zzfxm-song-facade';

const mySong = [/* ...song data... */];

// Create the facade
const songFacade = new ZzfxmSongFacade(mySong);

// Get the pattern count
console.log(songFacade.getPatternCount());
```

