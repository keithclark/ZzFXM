# ZzFX Music Generator

This is a music generator for use in tiny JavaScript productions (i.e. js13k games). ZzFXM uses a modified version of the super-tiny [ZzFX library](https://github.com/KilledByAPixel/ZzFX) by [Frank Force](https://twitter.com/KilledByAPixel) to generate instruments. The modified version of ZzFX is able create an array of audio data without immediately playing it.

The song format is loosely based on the MOD format, using patterns to handle repeating blocks of song data. Unlike MOD, patterns can be variable in length allowing repeatitive sequences of pattern data to be broken down into smaller chunks. Each pattern can also contain a variable number of channels, reducing the need to store empty data.


## Use

```html
<!-- load dependencies -->
<script src="zzfx.js"></script>
<script src="zzfxm.min.js"></script>

<script>
  // Create a song
  let mySongData = zzfxM(...song);

  // Play the song (returns a AudioBufferSourceNode)
  let myAudioNode = zzfxP(mySongData);

  // Stop the song
  myAudioNode.stop();
</script>
```


## Song Format

A ZzFXM song is a series of nested arrays containing instrument, pattern and sequence data:

```js
[                                     // Song
  [                                     // Instruments
    [.9, 0, 143, , , .35, 3],             // Instrument 1
    [1, 0, 216, , , .45, 1, 4, , ,50]     // Instrument 2
  ],
  [                                     // Patterns
    [                                     // Pattern 0
      [                                     // Channel 0
        1, 1, 0,                            // Using instrument 1, play C-1
        0, 0, 0,
        1, 5, 32,                           // Using instrument 1, play E-1 with 50% attenuation
        0, 0, 0
      ],
      [                                   // Channel 1
        2, 8, 0,                            // Using instrument 2, play G-1
        2, 8, 16,                           // Using instrument 2, play G-1 with 25% attenuation
        3, 1, 0,                            // Using instrument 3, play C-1
        0, 0, 0
      ]
    ]
  ],
  [                                     // Sequence
    0,                                    // Play pattern 0
    0,                                    // ...and again
  ],
  4,                                    // Speed
  {                                     // Metadata
    title: "My Song"                       // Name of the song
    author: "Keith Clark"                  // Name of the author/composer
  }
]
```



## Song Structure

```
[
  <instrument-list>,
  <pattern-list>,
  <sequence>,
  <speed>?,
  <metadata>?
]
```

## Instrument List Structure

```
[
  <instrument>,
  ...
]
```

## Instrument Structure

```
[
  <zzfx-sound-volume>?,
  <zzfx-sound-randomness>?,
  <zzfx-sound-frequency>?,
  <zzfx-sound-attack>?,
  <zzfx-sound-sustain>?,
  <zzfx-sound-release>?,
  <zzfx-sound-shape>?,
  <zzfx-sound-shapeCurve>?,
  <zzfx-sound-slide>?,
  <zzfx-sound-deltaSlide>?,
  <zzfx-sound-pitchJump>?,
  <zzfx-sound-pitchJumpTime>?,
  <zzfx-sound-repeatTime>?,
  <zzfx-sound-noise>?,
  <zzfx-sound-modulation>?,
  <zzfx-sound-bitCrush>?,
  <zzfx-sound-delay>?
]
```

An instrument is an array of optional ZzFX sound parameters. Any missing paramaters will be populated using the ZzFX default values.


Param | Description | Default | Min Value | Max Value
-|-|-|-|-
`volume` | Volume scale (percent) | 1 | -1000000000 | 1000000000
`randomness` | How much to randomize frequency (percent Hz) | 0.05 | -1000000000 | 1000000000
`frequency` | Frequency of sound (Hz) | 440 | -1000000000 | 1000000000
`attack` | Attack time, how fast sound starts (seconds) | 0 | 0 | 3
`sustain` | Sustain time, how long sound holds (seconds) | 0 | 0 | 3
`release` | Release time, how fast sound fades out (seconds) | 0 | 0 | 3
`shape` | Shape of the sound wave (0=sin, 1=triangle, 2=saw, 3=tan, 4=bit noise) | 0 | -|-
`shapeCurve` | Squarenes of wave (0=square, 1=normal, 2=pointy) | 0 | 0 | 1000000000
`slide` | How much to slide frequency (kHz/s) | 0 | -1000000000 | 1000000000
`deltaSlide` | How much to change slide (kHz/s/s) | 0 | -1000000000 | 1000000000
`pitchJump` | Frequency of pitch jump (Hz) | 0 | -1000000000 | 1000000000
`pitchJumpTime` | Time of pitch jump (seconds) | 0 | -1000000000 | 1000000000
`repeatTime` | Resets some parameters periodically (seconds) | 0 | -1000000000 | 1000000000
`noise` | How much random noise to add (percent) | 0 | -1000000000 | 1000000000
`modulation` | Frequency of modulation wave, negative flips phase (Hz) | 0 | -1000000000 | 1000000000
`bitCrush` | Resamples at a lower frequency in (samples*100) | 0 | -1000000000 | 1000000000
`delay` | Overlap with itself for reverb and flanger effects (seconds) | 0 | 0 | 1000000000


## Pattern List Structure

```
[
  <pattern>,
  ...
]
```

## Pattern Structure

```
[
  <channel>,
  ...
]
```

## Channel Structure

```
[
  <channel-instrument>, <channel-period>, <channel-attenuation>,
  ...
]
```

Channel data is a single array containing 3 slots for each row in the current pattern.
The first slot indicates which instrument to use for playing notes. Slot 2 contains the note period and slot 3 holds the attenuation value. A `0` value indicates a noop for that slot.

## Channel Period

If this slot contains a value between 1 and 36 then the corresponding note will be played with the current instrument. When a new period is set any note currently playing in the channel is stopped and the channel attenuation is reset.

Value | Note | Value | Note | Value | Note
------|------|-------|------|-------|-----
`01`  | C-1  | `0d`  | C-2  | `19`  | C-3
`02`  | C#1  | `0e`  | C#2  | `1a`  | C#3
`03`  | D-1  | `0f`  | D-2  | `1b`  | D-3
`04`  | D#1  | `10`  | D#2  | `1c`  | D#3
`05`  | E-1  | `11`  | E-2  | `1d`  | E-3
`06`  | F-1  | `12`  | F-2  | `1e`  | F-3
`07`  | F#1  | `13`  | F#2  | `1f`  | F#3
`08`  | G-1  | `14`  | G-2  | `20`  | G-3
`09`  | G#1  | `15`  | G#2  | `21`  | G#3
`0a`  | A-1  | `16`  | A-2  | `22`  | A-3
`0b`  | A#1  | `17`  | A#2  | `23`  | A#3
`0c`  | B-1  | `18`  | B-2  | `24`  | B-3


## Channel Instrument

This contains an index pointing to the songs instrument array. If it contains a non-zero value then instrument `value-1` is set as the current instrument for future notes.

If you wish to use the same instrument for consecutive notes, you only need to set it once.

```js
[
  1, 1, 0,        // Set instrument 1 and play C-1
  0, 5, 0,        // Using current instrument (1), play E-1
  0, 6, 0         // Using current instrument (1), play F-1
  2, 3, 0         // Set instrument 2 and play D-1
],
```

## Channel Attenuation

If this slot contains a value between 1 and 64 the volume of the channel is reduced accordingly. A value of `1` sets the volume to 100%, `64` sets the volume to 0%.

```js
[
  1, 1, 0,        // Set instrument 1 and play C-1
  0, 0, 16,       // Drop volume by 25%
  0, 0, 32,       // Drop volume by 50%
  0, 0, 48,       // Drop volume by 75%
  2, 1, 0         // Set instrument 2 and play C-1 (Attenuation is reset)
],
```

## Sequence Structure

```
[
  <integer>,
  ...
]
```

Sequence is an array of numbers indexing `<pattern>` entries in the `<pattern-list>`. Each pattern in the sequence is played until there are no remaining values, at which point the song is complete.

```js
[0, 1, 1, 2]       // play pattern 0 followed by pattern 1 (twice) then pattern 2
```

## Speed

```
<integer>
```

The speed of the song. Lower is faster. Default speed is 6.

## Metadata Structure

```
{
  <song-property>,
  ...
}
```

Metadata is used to store song information that isn't required for playback such as the title, credits and human-readable aliases for data.

Property | Description
-|-
`name` | Title of the song
`author` | Name of the composer
`instruments` | Array of instrument names that map to `<instrument-list>`

```js
const mySong = [
  [
    [1, 0, 200],
    [1, 0, 500]
  ],
  [ /* ...patterns... */ ],
  [ /* ...sequence... */ ],
  6,
  {
    title: "My Song",
    author: "Keith Clark",
    instruments: ["Bass", "Piano"]
  }
]
```
