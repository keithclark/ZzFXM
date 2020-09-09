# ZzFXM Song Convertor

This tool converts ProTracker MOD files into ZzFXM songs. It will attempt to assign instruments if it can.

The ProTracker convertor can process the following ProTracker effects:

Code | Description    | Support Level | Notes
-|-|-|-
`Axy` | Volume slide  | Emulated      | Volume slides are computed and replaced with `Cxx` steps
`Cxx` | Set volume    | Full
`Dxx` | Pattern break | Partial       | (only breaking to first row of next pattern is supported)


## Installation

1. Clone this repo
2. Change to the convert tool directory and install dependencies:
```
cd tools/convert
npm install
npm link
```

## Use

You can run the convertor from the CLI:

```
> zzfx-convert input-song.mod output-song.js
```

## Options

Use the `--help` argument for more info.

```
zzfx-convert --help
```
