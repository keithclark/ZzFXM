<script>
import { PATTERN_ROW_FINE_STEP, PATTERN_ROW_COARSE_STEP, ATTENUATION_FINE_STEP, ATTENUATION_COARSE_STEP} from '../config.js';

import { instrumentsMeta } from '../stores.js';
import { clamp, round } from '../lib/utils.js';
import { playNote } from '../services/RendererService.js';
import PanningProperty from './PanningProperty.svelte';
import Toolbar from './Toolbar.svelte';
import Field from './Field.svelte';

export let data = [];
export let title = 'Track';
export let selectedRow = 0;

$: scrollPos = `${-selectedRow * 18}px`;
$: selectedAttenuation = data[selectedRow + 2] % 1;
$: selectedNote = data[selectedRow + 2] | 0;
$: totalRows = data.length - 3;

const NOTE_NAMES = [
  'REL', '---',
  'C-1', 'C#1', 'D-1', 'D#1', 'E-1', 'F-1',
  'F#1', 'G-1', 'G#1', 'A-1', 'A#1', 'B-1',
  'C-2', 'C#2', 'D-2', 'D#2', 'E-2', 'F-2',
  'F#2', 'G-2', 'G#2', 'A-2', 'A#2', 'B-2',
  'C-3', 'C#3', 'D-3', 'D#3', 'E-3', 'F-3',
  'F#3', 'G-3', 'G#3', 'A-3', 'A#3', 'B-3'
];

const NOTE_KEY_CODES = {
  'z': 1, 's': 2, 'x': 3, 'd': 4, 'c': 5, 'v': 6, 'g': 7, 'b': 8, 'h': 9,
  'n': 10, 'j': 11, 'm': 12, ',': 13, 'l': 14, '.': 15, ';': 16, '/': 17,
  'q': 18, '2': 19, 'w': 20, '3': 21, 'e': 22, 'r': 23, '5': 24, 't': 25,
  '6': 26, 'y': 27, '7': 28, 'u': 29, 'i': 30, '9': 31, 'o': 32, '0': 33,
  'p': 34, '[': 35, '=': 36
};


const setSelectedNote = note => {
  data[selectedRow + 2] = note + selectedAttenuation;
}

const setSelectedAttenuation = attenuation => {
  data[selectedRow + 2] = selectedNote + clamp(round(attenuation, 2), 0, .99);
}

const handleKeyPress = event => {
  const {key, altKey, shiftKey} = event;
  if (key === 'ArrowUp') {
    if (altKey) {
      const step = shiftKey ? ATTENUATION_COARSE_STEP : ATTENUATION_FINE_STEP;
      setSelectedAttenuation(selectedAttenuation + step);
    } else {
      const step =  shiftKey ? PATTERN_ROW_COARSE_STEP : PATTERN_ROW_FINE_STEP;
      selectedRow = Math.max(0, selectedRow - step);
    }
  } else if (key === 'ArrowDown') {
    if (altKey) {
      const step = shiftKey ? ATTENUATION_COARSE_STEP : ATTENUATION_FINE_STEP;
      setSelectedAttenuation(selectedAttenuation - step);
    } else {
      const step = shiftKey ? PATTERN_ROW_COARSE_STEP : PATTERN_ROW_FINE_STEP;
      selectedRow = Math.min(totalRows, selectedRow + step);
    }
  } if (key === ' ') {
    setSelectedNote(-1);
  } else if (key === 'Backspace') {
    event.preventDefault();
    setSelectedNote(0);
  } else {
    const note = NOTE_KEY_CODES[key];
    if (note) {
      setSelectedNote(note);
      playNote(data[0] || 0, note);
    }
  }
}

const handleScroll = event => {
  const {deltaY, deltaMode} = event;
  if (deltaMode === 0) {
    const step = deltaY / 4 | 0;
    selectedRow = clamp(selectedRow + step, 0, totalRows);
  }
}

</script>

<div class="channel">
  <Toolbar>
    <Field label={title}>
      <select class="select" bind:value={data[0]}>
        {#each $instrumentsMeta as name, i}
          <option value={i}>{name}</option>
        {/each}
      </select>
    </Field>
  </Toolbar>

  <div class="noteList" tabindex="0" on:keydown={handleKeyPress} on:wheel={handleScroll}>
    <pre class="notes" style="transform:translateY({scrollPos})">{data.slice(2).map(note => `${NOTE_NAMES[1 + note | 0]} ${((note % 1) * 100).toFixed().padStart(2,'0')}`).join('\n')}</pre>
  </div>

  <div class="outset">
    <PanningProperty bind:value={data[1]} />
  </div>

</div>

<style>
.select {
  width: 100%;
}
.channel {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  width: 100%;
}
.noteList {
  overflow: hidden;
  position: relative;
  background-image: linear-gradient(#fff 0, #fff 18px);
  background-size:100% 18px;
  background-repeat: no-repeat;
  background-position: 0 50%;
  text-align-last: justify;
  font-family: monospace;
  line-height:18px;
  width:100%;
  box-sizing:border-box;
}
.notes {
  position: absolute;
  top: 50%;
  margin-top:-8px;
  width:100%;
  min-width:0;
  padding:0 1em;
  background-image: linear-gradient( #0001 18px, transparent 18px);
  background-size:100% 72px;
  white-space: pre-line;
}
.channel :global(.field) {
  align-items: center!important;
}
.channel :global(.field__controls) {
  width: 100% !important;
}
pre {
  margin: 0
}
</style>