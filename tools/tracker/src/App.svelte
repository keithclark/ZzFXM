<script>

  import { patterns, sequence, speed, title, selectedRow, selectedChannel, selectedPattern, selectedSequence, masterVolume, currentPlaybackPosition, songPlaying } from './stores.js';
  import { serializeSong, createEmptySong, loadSongFromFile, loadSongFromString } from './services/SongService.js';
  import { playPattern, playSong, stopSong, playNote } from './services/RendererService.js';
  import { getCumlativeRowAtPosition } from './services/SequenceService.js';
  import { adjustAttenuation, setNote } from './services/PatternService.js';
  import { isInputElement } from './lib/utils.js';
  import { NOTE_KEY_CODES, PATTERN_ROW_FINE_STEP, PATTERN_ROW_COARSE_STEP, ATTENUATION_FINE_STEP, ATTENUATION_COARSE_STEP} from './config.js';

  import SequenceEditor from './components/SequenceEditor.svelte';
	import InstrumentEditor from './components/InstrumentEditor.svelte';
	import PatternEditor from './components/PatternEditor.svelte';
  import TextProperty from './components/TextProperty.svelte';
  import NumberProperty from './components/NumberProperty.svelte';
  import Property from './components/Property.svelte'
  import Toolbar from './components/Toolbar.svelte';
  import Field from './components/Field.svelte';
  import Button from './components/Button.svelte';
  import ToggleButton from './components/ToggleButton.svelte';
  import Slider from './components/Slider.svelte';
  import Pane from './components/Pane.svelte';
  import KeyboardModal from './components/modals/KeyboardModal.svelte';
  import AboutModal from './components/modals/AboutModal.svelte';
  import SourceModal from './components/modals/SourceModal.svelte';
  import SettingsModal from './components/modals/SettingsModal.svelte';
  import demoSong from './demo.js';

  let files;
  let fileElem;
  let showKeysHelpModal = false;
  let showAboutModal = false;
  let showSourceModal = false;
  let showSettingsModal = false;
  let showPaino = window.matchMedia('(min-height: 500px)').matches;
  let showInstruments = window.matchMedia('(min-height: 800px)').matches;

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
    stopSong();
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

  const handleLoadSongClick = () => {
    fileElem.click();
  }

  const handleSaveSongClick = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(serializeSong()));
    element.setAttribute('download', `${$title}.js`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    element.remove();
  }

  const handleHelpClick = () => {
    showKeysHelpModal = true;
  }

  const handleAboutClick = () => {
    showAboutModal = true;
  }

  const handleKeyPress = event => {
    const { key, shiftKey, altKey, ctrlKey, metaKey } = event;

    // If the active element is a form input (button, input etc.) do nothing
    if (isInputElement(document.activeElement)) {
      return;
    }

    if (key === 'ArrowLeft') {
      $selectedChannel--;
    } else if (key === 'ArrowRight') {
      $selectedChannel++;
    } else if (key === 'ArrowUp') {
      if (altKey) {
        const step = shiftKey ? ATTENUATION_COARSE_STEP : ATTENUATION_FINE_STEP;
        adjustAttenuation($selectedPattern, $selectedChannel, $selectedRow, step);
      } else {
        const step = shiftKey ? PATTERN_ROW_COARSE_STEP : PATTERN_ROW_FINE_STEP;
        $selectedRow = Math.max(0, $selectedRow - step);
      }
    } else if (key === 'ArrowDown') {
      if (altKey) {
        const step = shiftKey ? ATTENUATION_COARSE_STEP : ATTENUATION_FINE_STEP;
        adjustAttenuation($selectedPattern, $selectedChannel, $selectedRow, -step)
      } else {
        const step = shiftKey ? PATTERN_ROW_COARSE_STEP : PATTERN_ROW_FINE_STEP;
        $selectedRow = Math.min($patterns[$selectedPattern][0].length - 3, $selectedRow + step);
      }
    } else if (key === ' ') {
      setNote($selectedPattern, $selectedChannel, $selectedRow, -1);
    } else if (key === 'Backspace') {
      event.preventDefault();
      setNote($selectedPattern, $selectedChannel, $selectedRow, 0);
    } else if (key === 'Enter') {
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
      event.preventDefault();
    } else if (!shiftKey && !altKey && !metaKey && !ctrlKey) {
      const note = NOTE_KEY_CODES[key];
      if (note) {
        setNote($selectedPattern, $selectedChannel, $selectedRow, note);
        playNote($patterns[$selectedPattern][$selectedChannel][0] || 0, note);
      }
    }
  }

  const handleNewSongClick = () => {
    stopSong();
    createEmptySong();
    resetSongPosition();
  }

  const handleSourceClick = () => {
    showSourceModal = true;
  }

  const handlePianoToggleClick = () => {
    showPaino = !showPaino;
  }

  const handleInstrumentsToggleClick = () => {
    showInstruments = !showInstruments;
  }

  const handleSettingsClick = () => {
    showSettingsModal = !showSettingsModal;
  }

  const handleLoadDemoClick = () => {
    stopSong();
    loadSongFromString(demoSong);
    resetSongPosition();
  }

  if (new URLSearchParams(location.search).has('demo')) {
    loadSongFromString(demoSong);
  } else {
    createEmptySong();
  }
</script>

<main>
  <Pane>
    <div slot="head">
      <Toolbar>
        <TextProperty label="Title" bind:value={$title} />
        <NumberProperty label="Speed" bind:value={$speed} size={3} min={1} max={320} />
        <Field label="File">
          <Button label="New" on:click={handleNewSongClick} />
          <Button label="Load" on:click={handleLoadSongClick} />
          <Button label="Save" on:click={handleSaveSongClick} />
          <Button label="Source" on:click={handleSourceClick} />
          <Button label="Load Demo" on:click={handleLoadDemoClick} />
        </Field>
        <Field label="Toggle Tools">
          <ToggleButton checked={showPaino} on:click={handlePianoToggleClick} label="Piano" />
          <ToggleButton checked={showInstruments} on:click={handleInstrumentsToggleClick} label="Instruments" />
        </Field>
        <Property label="Master Volume" let:id>
          <Slider {id} min={0} max={1} step={.1} bind:value={$masterVolume} />
        </Property>
        <Field label="Help">
          <Button label="Settings" on:click={handleSettingsClick} />
          <Button label="About" on:click={handleAboutClick} />
          <Button label="Keys" on:click={handleHelpClick} />
        </Field>

        <div class="outset"></div>
      </Toolbar>
    </div>
  </Pane>

  <SequenceEditor bind:selectedPosition={$selectedSequence} on:select={handlePositionSelect} on:input={handlePositionChange} />

  <PatternEditor piano={showPaino} bind:selectedChannel={$selectedChannel} bind:selectedRow={$selectedRow} bind:selectedPattern={$selectedPattern} on:patternselect={handlePatternSelect} />

  {#if showInstruments}
    <InstrumentEditor />
  {/if}

</main>

<KeyboardModal bind:open={showKeysHelpModal} />
<AboutModal bind:open={showAboutModal} />
<SourceModal bind:open={showSourceModal} />
<SettingsModal bind:open={showSettingsModal} />

<input type="file" hidden bind:this={fileElem} bind:files>
<svelte:window on:keydown={handleKeyPress} />

<style>
  main {
    display: grid;
    grid-template-rows: auto auto 1fr;
    height: 100vh;
    gap: var(--panel-spacing);
    padding: var(--panel-spacing);
    box-sizing: border-box;
  }
</style>
