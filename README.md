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
  let myAudioNode = zzfxP(...mySongData);

  // Stop the song
  myAudioNode.stop();
</script>
```

## Tooling

This repo contains various tools to help you generate and work with ZzFXM songs:

### [Tracker](./tools/tracker)
A browser-based music tracker for composing songs for ZzFXM. (Available [online](https://keithclark.github.io/ZzFXM/tracker/).)

### [Song Conversion Tool](./tools/convert)
A CLI tool for converting file in ProTracker MOD (M.K.) format to the ZzFXM format. This allows you to use tools such as [MilkyTracker](https://milkytracker.titandemo.org/) or the browser-based [Bassoon Tracker](https://www.stef.be/bassoontracker/) to author your songs. In order to keep ZzFXM small, only the volume and pattern break effects are 100% supported. The volume sliding effect is partially emulated by the song conversion tool by replacing the effect with computed volume steps.

### [Song Packer Tool](./tools/songpack)
The song packer CLI tool compresses song data. It uses plugins so you can extend it with custom code if you need to.

### [Local Modules](./tools/local_modules)
This repo contains various local node modules that are shared between the tools. Please use them if you wish to create additional tooling.


## Song Format

A ZzFXM song is a series of nested arrays containing instrument, pattern and sequence data:

```js
[                                     // Song
  [                                     // Instruments
    [.9, 0, 143, , , .35, 3],             // Instrument 0
    [1, 0, 216, , , .45, 1, 4, , ,50],    // Instrument 1
    [.75, 0, 196, , .08, .18, 3]          // Instrument 2
  ],
  [                                     // Patterns
    [                                     // Pattern 0
      [                                     // Channel 0
        0,                                    // Using instrument 0
        -1,                                   // From the left speaker
        1,                                    // play C-1
        0, 0, 0,                              // rest (x3)
        3.5,                                  // play E-1 with 50% attenuation
        0, 0, 0                               // rest (x3)
      ],
      [                                     // Channel 1
        1,                                    // Using instrument 1
        1,                                    // From the right speaker
        2,                                    // play D-1
        2.25,                                 // play D-1 with 25% attenuation
        3.5,                                  // Play E-1 with 50% attenuation
        4.75,                                 // Play F-1 with 75% attenuation
        -1,                                   // Release the note
        0, 0, 0                               // rest (x3)
      ]
    ]
  ],
  [                                     // Sequence
    0,                                    // Play pattern 0
    0,                                    // ...and again
  ],
  120,                                  // 120 BPM
  {                                     // Metadata
    title: "My Song",                      // Name of the song
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

## `<instrument-list>` structure

```
[
  <instrument>,
  ...
]
```

## `<instrument>` structure

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
  <zzfx-sound-delay>?,
  <zzfx-sound-sustain-volume>?,
  <zzfx-sound-decay>?,
  <zzfx-sound-tremolo>?
]
```

An instrument is an array of optional ZzFX sound parameters. Any missing paramaters will be populated using the ZzFX default values.


Param | Description | Default | Min Value | Max Value
-|-|-|-|-
`volume` | Volume scale (percent) | 1 | -1000000000 | 1000000000
`randomness` | How much to randomize frequency (percent Hz) | 0.05 | -1000000000 | 1000000000
`frequency` | Frequency of sound (Hz) | REQUIRED | -1000000000 | 1000000000
`attack` | Attack time, how fast sound starts (seconds) | 0 | 0 | 3
`sustain` | Sustain time, how long sound holds (seconds) | 0 | 0 | 3
`release` | Release time, how fast sound fades out (seconds) | 0.1 | 0 | 3
`shape` | Shape of the sound wave (0=sin, 1=triangle, 2=saw, 3=tan, 4=bit noise) | 0 | -|-
`shapeCurve` | Squarenes of wave (0=square, 1=normal, 2=pointy) | 1 | 0 | 1000000000
`slide` | How much to slide frequency (kHz/s) | 0 | -1000000000 | 1000000000
`deltaSlide` | How much to change slide (kHz/s/s) | 0 | -1000000000 | 1000000000
`pitchJump` | Frequency of pitch jump (Hz) | 0 | -1000000000 | 1000000000
`pitchJumpTime` | Time of pitch jump (seconds) | 0 | -1000000000 | 1000000000
`repeatTime` | Resets some parameters periodically (seconds) | 0 | -1000000000 | 1000000000
`noise` | How much random noise to add (percent) | 0 | -1000000000 | 1000000000
`modulation` | Frequency of modulation wave, negative flips phase (Hz) | 0 | -1000000000 | 1000000000
`bitCrush` | Resamples at a lower frequency in (samples*100) | 0 | -1000000000 | 1000000000
`delay` | Overlap with itself for reverb and flanger effects (seconds) | 0 | 0 | 1000000000
`sustainVolume` | Volume level for sustain (percent) | 1 | -1000000000 | 1000000000
`decay` | Decay time, how long to reach sustain after attack | 0 | 0 | 1
`tremolo` | Trembling effect, rate controlled by repeat time (precent) | 0 | 0 | 1

## `<pattern-list>` structure

```
[
  <pattern>,
  ...
]
```

## `<pattern>` structure

```
[
  <channel>,
  ...
]
```

## `<channel>` structure

```
[
  <channel-instrument>, <channel-panning>, <channel-note>+
]
```

Channel data is a single array containing the instrument, panning and note data the current pattern.
The first slot indicates which instrument to use for playing notes. Slot 2 contains the channel panning value and slots 3 onwards hold the note. If the array slot for an instrument, panning or note value is left empty it will coalesced to `0`.

## `<channel-instrument>` structure

```
<integer>
```

This contains an integer index pointing to the songs instrument array.

## `<channel-panning>` structure

```
<number>
```

Set the stereo positioning of the song channel. A value of `-1` will cause the channel to play from the left speaker. A value of `1` will cause the channel to play from the right speaker. A value between `-1` and `1` will move the channel between the left and right speaker, with `0` causing the channel to play from both.

## `<channel-note>` structure

```
<number>
```

The note value describes both the period and attenuation of a note. The period is the integer part of the number and the attentuation is the decimal part (`0` - `0.99`).

If the period is a value between `1` and `36` the corresponding note will be played using the channel instrument. When a new period is set any note currently playing in the channel is stopped and the channel attenuation is reset. A note value of `0` indicates a noop and `-1` indicates note release (stops playing the note)

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

The attenuation component is used to control volume - here is an example of playing consecutive `C-1` notes while fading out:

```js
[
  1,    // full volume
  1.2,  // 80% volume
  1.4,  // 60% volume
  1.6,  // 40% volume
  1.8   // 20% volume,
  -1    // release (mute the note)
]
```


## `<sequence>` structure

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

## `<speed>` structure

```
<integer>
```

The speed of the song in BPM.


## `<metadata>` structure

```
{
  <song-property>,
  ...
}
```

Metadata is used to store song information that isn't required for playback such as the title, credits and human-readable aliases for data.

Property | Description
-|-
`title` | Title of the song
`author` | Name of the composer
`authorUrl` | URL of the composer (Website, GitHub profile, Twitter)
`license` | The license for the song
`instruments` | Array of instrument names that map to `<instrument-list>`

```js
const mySong = [
  [
    [1, 0, 200],
    [1, 0, 500]
  ],
  [ /* ... patterns ... */ ],
  [ /* ... sequence ... */ ],
  120,
  {
    "title": "My Song",
    "author": "Keith Clark",
    "authorUrl": "https://keithclark.co.uk/"
    "license": "CC0",
    "instruments": ["Bass", "Piano"]
  }
]
```
