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
