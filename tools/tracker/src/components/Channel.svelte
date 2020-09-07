<script>
import { instrumentsMeta } from '../stores.js';
import { clamp } from '../lib/utils.js';
import PanningProperty from './PanningProperty.svelte';
import Toolbar from './Toolbar.svelte';
import Field from './Field.svelte';

export let data = [];
export let title = 'Track';
export let selectedRow = 0;
export let mute = false;

$: scrollPos = `${-selectedRow * 18}px`;
$: totalRows = data.length - 3;

let scrollSpeed = 0;

const NOTE_NAMES = [
  'REL', '---',
  'C-1', 'C#1', 'D-1', 'D#1', 'E-1', 'F-1',
  'F#1', 'G-1', 'G#1', 'A-1', 'A#1', 'B-1',
  'C-2', 'C#2', 'D-2', 'D#2', 'E-2', 'F-2',
  'F#2', 'G-2', 'G#2', 'A-2', 'A#2', 'B-2',
  'C-3', 'C#3', 'D-3', 'D#3', 'E-3', 'F-3',
  'F#3', 'G-3', 'G#3', 'A-3', 'A#3', 'B-3'
];

const handleScroll = event => {
  const {deltaY, deltaMode} = event;
  if (deltaMode === 0) {
    const step = deltaY / 4 | 0;
    selectedRow = clamp(selectedRow + step, 0, totalRows);
  }
}

const decelerate = () => {
  if (Math.abs(scrollSpeed)>.2) {
    requestAnimationFrame(decelerate);
    selectedRow += scrollSpeed / 4 | 0;
    scrollSpeed *= .85;
  } else {
    scrollSpeed = 0;
  }
}

const handleTouchStart = event => {
  if (event.targetTouches.length > 1) {
    return;
  }
  const startPos = event.targetTouches[0].screenY;
  const startRow = selectedRow;
  let prevPos = startPos;
  scrollSpeed = 0;

  const moveHandler = event => {
    const pos = event.targetTouches[0].screenY;
    const step = (pos - startPos) / 18 | 0;
    scrollSpeed = prevPos - pos;
    selectedRow = clamp(startRow - step, 0, totalRows);
    prevPos = pos;
  }

  const endHandler = event => {
    if (Math.abs(prevPos - startPos) < 5) {
      event.target.focus();
    } else if (Math.abs(scrollSpeed) > .1) {
      decelerate();
    }
    window.removeEventListener('touchmove', moveHandler);
    window.removeEventListener('touchend', endHandler);
  }

  window.addEventListener('touchmove',moveHandler )
  window.addEventListener('touchend',endHandler )
}
</script>

<div class:mute class="channel">
  <Toolbar>
    <Field label={title}>
      <select class="select" bind:value={data[0]}>
        {#each $instrumentsMeta as name, i}
          <option value={i}>{name}</option>
        {/each}
      </select>
    </Field>
  </Toolbar>

  <div class="noteList" tabindex="0" on:wheel={handleScroll} on:touchstart|preventDefault={handleTouchStart}>
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
  pointer-events: none;
  position: absolute;
  top: 50%;
  margin-top:-8px;
  width:100%;
  min-width:0;
  padding:0 1em;
  background-image: linear-gradient( #0001 18px, transparent 18px);
  background-size:100% 72px;
  white-space: pre-line;
  will-change: transform;
}
.channel :global(.field) {
  align-items: center!important;
}
.channel :global(.field__controls) {
  width: 100% !important;
}
.mute {
  background:repeating-linear-gradient(45deg, #0001 0, #0001 5px,#0000 5px, #0000 10px);
}
pre {
  margin: 0;
}
</style>
