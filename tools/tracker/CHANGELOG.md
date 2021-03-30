v1.0.6b (31th Mar. 2021)

* Update dependencies (svelte, rollup, terser)
* Fixed issue causing app to crash when loading a new song that doesn't fulfill the current selections
* Fixed issue allowing attenuation adjustment on note-release
* Fixed attenuation not being reset when setting from a note to note-release
* Added sample caching service for the song renderer
* Fixed issue with pattern index selection going out of bounds
* Fixed issue with attenuation level roll-off

v1.0.5b (20th Oct. 2020)

* Instrument editor selection now switches to match the currently selected track
* Instrument editor caches waveform preview data to speed up sample switching
* Fixed instrument picker "Apply" button not appearing (regression)
* Replaced zero attentuation with `--` in pattern editor to reduce clutter
* Fixed bug with copying tracks between patterns having differing lengths
* Fixed font in pattern editor
* Fixed `<select>` styling in Safari
* Fixed source editor collapsing in Safari
* Fixed "About" content in Safari

v1.0.4b (15th Oct. 2020)

* Playback marker will scroll into view when playing.
* Added gzip (deflate) size report to song properties pane
* Reworked modal windows. Added ESC to close
* Better styling for select elements
* Fixed incorrect key map for the piano input
* Added note preview option to instrument editor
* Added autoplay toggle to instrument editor
* Fixed issue with shape not applying to preview sound when changing value
* Fixed issue with instrument preview sound layering - previous sound is now stopped
* Added hint property to `<Button>` and `<ToggleButton>` for contextual help
* Updated Sanxion to use tremolo effect and removed a spurious note

v1.0.3b (23rd Sept. 2020)

* Fixed issue with pattern copy / paste using reference instead of value
* Fixed clicks when playing the end of instrument samples
* Fixed issue with instruments not importing correctly
* Added support for loading songs by URL (server must supply CORS headers)
* Added a song properties modal
* Added support for extensible meta data. The tracker won't remove properties it doesn't understand.

v1.0.2b (7th Sept. 2020)

* Added mute controls so tracks can be disabled while working on a pattern
* Fixed issue with patterns not scrolling on touch devices
* Updated Piano and Instrument toggle UI
* Fixed errors caused by removing patterns or instruments
* Fixed UI layout to collapse smaller screens
* Fixed issue with sticky sequence selection when song is playing
* Fixed issue with instrument usage info not updating when changing track instrument
* Converted Play/Stop button to toggle to save space
* Moved song Play/Stop button to sequence panel

v1.0.1b (5th Sept. 2020)

* Allow UI to update independently from the audio buffer. UI can now run at 60FPS
* Settings dialog
* Setting to control player buffer size so slow devices can buffer more data.
* Setting to control sample rate so samples can be created at a lower quality in favour of performance.
* Setting to allow UI updates to be throttled to preferred FPS.

v1.0.0b

* Initial release
