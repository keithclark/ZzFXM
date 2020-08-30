<script>

	import demoSong from './demo.js';
  import { patterns, sequence, speed, title, selectedRow, selectedPattern, selectedSequence, masterVolume, currentPlaybackPosition, songPlaying } from './stores.js';
  import { setSong, serializeSong, createEmptySong, loadSongFromFile, loadSongFromString } from './services/SongService.js';
  import { playPattern, playSong, stopSong } from './services/RendererService.js';
  import { getCumlativeRowAtPosition } from './services/SequenceService.js';

  import SequenceEditor from './components/SequenceEditor.svelte';
	import InstrumentEditor from './components/InstrumentEditor.svelte';
	import PatternEditor from './components/PatternEditor.svelte';
  import TextProperty from './components/TextProperty.svelte';
  import NumberProperty from './components/NumberProperty.svelte';
  import Property from './components/Property.svelte'
  import Toolbar from './components/Toolbar.svelte';
  import Field from './components/Field.svelte';
  import Button from './components/Button.svelte';
  import Slider from './components/Slider.svelte';
  import Pane from './components/Pane.svelte';
  import KeyboardModal from './components/KeyboardModal.svelte';
  import AboutModal from './components/AboutModal.svelte';


  let files;
  let fileElem;
  let showHelpModal = false;
  let showAboutModal = false;

  $: if (files) {
    stopSong();
    loadSongFromFile(files[0])
      .then(resetSongPosition)
      .catch(err => alert(err.message));
    files = null;
  }

  $: patternStartPosition = getCumlativeRowAtPosition($selectedSequence);
  $: patternPosition = patternStartPosition + $selectedRow;
  $: if ($selectedSequence !== null) {
    currentPlaybackPosition.set(patternPosition);
  } else {
    currentPlaybackPosition.set(-1);
  }

  const resetSongPosition = () => {
    selectedSequence.set(0);
    selectedPattern.set($sequence[0]);
    selectedRow.set(0);
  }

  const resetPatternPosition = () => {
    selectedRow.set(0);
  }

  const handlePatternSelect = () => {
    stopSong()
    currentPlaybackPosition.set(-1);
    selectedSequence.set(null);
  }

  const handlePositionChange = () => {
    selectedPattern.set($sequence[$selectedSequence]);
  }

  const handlePositionSelect = () => {
    stopSong();
    selectedPattern.set($sequence[$selectedSequence]);
    selectedRow.set(0);
  }

  const handlePlaySongClick = () => {
    playSong();
  }

  const handleStopClick = () => {
    stopSong();
  }

  const handleLoadSongClick = () => {
    fileElem.click();
  }

  const handleSaveSongClick = () => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(serializeSong()));
    element.setAttribute('download', `${$title}.js`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    element.remove();
  }

  const handleHelpClick = () => {
    showHelpModal = true;
  }

  const handleAboutClick = () => {
    showAboutModal = true;
  }

  const handleKeyPress = event => {
    const {key, shiftKey, altKey} = event;
    if (key === 'Enter') {
      if ($songPlaying) {
        stopSong();
      } else {

        if (altKey) {
          if (shiftKey) {
            resetSongPosition();
          }
          playSong();
        } else {
          if (shiftKey) {
            resetPatternPosition();
          }
          playPattern($selectedPattern);
        }
      }
      event.preventDefault()
    }
  }

  const handleNewSongClick = () => {
    stopSong();
    createEmptySong();
    resetSongPosition();
  }

  // Start with an empty song
  loadSongFromString(demoSong);
  //createEmptySong();

</script>

<main>
  <Pane>
    <div slot="head">
      <Toolbar>
        <TextProperty label="Title" bind:value={$title} />
        <NumberProperty label="Speed" bind:value={$speed} size={3} min={1} max={320} />
        <Field label="Playback">
          <Button keyboard="ALT + ENTER" label="Play Song" on:click={handlePlaySongClick} />
          <Button keyboard="ENTER" label="Stop" on:click={handleStopClick} />
        </Field>
        <Field label="File">
          <Button label="New" on:click={handleNewSongClick} />
          <Button label="Load" on:click={handleLoadSongClick} />
          <Button label="Save" on:click={handleSaveSongClick} />
        </Field>
        <Property label="Master Volume" let:id>
          <Slider {id} min={0} max={1} step={.1} bind:value={$masterVolume} />
        </Property>
        <Field label="Info">
          <Button label="About" on:click={handleAboutClick} />
          <Button label="Help" on:click={handleHelpClick} />
        </Field>
        <div class="outset"></div>
      </Toolbar>
    </div>
  </Pane>

  <SequenceEditor bind:selectedPosition={$selectedSequence} on:select={handlePositionSelect} on:input={handlePositionChange} />

  <PatternEditor bind:selectedRow={$selectedRow} bind:selectedPattern={$selectedPattern} on:patternselect={handlePatternSelect} />

  <InstrumentEditor />
</main>

<KeyboardModal bind:open={showHelpModal} />
<AboutModal bind:open={showAboutModal} />

<input type="file" hidden bind:this={fileElem} bind:files>
<svelte:window on:keypress={handleKeyPress} />

<style>
  main {
    display: grid;
    grid-template-rows:  auto auto 1fr auto;
    height: 100vh;
    gap: var(--panel-spacing);
    padding: var(--panel-spacing);
    box-sizing: border-box;
  }
</style>