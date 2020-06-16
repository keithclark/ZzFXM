# Protracker parser

## Tokens

Name | Value | Description
-|-|-
`title` | String | The title of the song.
`channelCount` | Number | The number of channels.
`sequence` | Number[] | The pattern index sequence for the song.
`sampleMeta` | Sample | A song sample meta data.
`sampleData` | Array | A song sample data (8-bit unsigned mono).
`pattern` | Number | Emitted when the parser enters a new pattern. Token value indicates the pattern number.
`patternEnd` | Number | Emitted when the parser leaves a pattern. Token value indicates the pattern number.
`row` | Number | Emitted when the parser enters a new pattern row. Token value indicates the row number.
`rowEnd` | Number | Emitted when the parser leaves a row. Token value indicates the row number.
`channel` | Number | Emitted when the parser enters a new row channel. Token value indicates the row number.
`channelEnd` | Number | Emitted when the parser leaves a channel. Token value indicates the channel number.
`notePeriod` | Number | The period to play or `0` if the row is blank.
`noteInstrument` | Number | The instrument to play or `0` if the row is blank.
`noteEffectCode` | Number | The effect to use or `0` if no effect is set.
`noteEffectParam` | Number | The effect parameter to apply or `0` if no param is set.

### Sample Token

Name | Value | Description
-|-|-
`name` | String | Name of the sample
`size` | Number | Length of the sample in bytes
`data` | Int8Array | Sample data.