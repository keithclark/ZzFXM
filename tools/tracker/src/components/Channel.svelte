<script>
import { instrumentsMeta } from '../stores.js';
import { getNoteName } from '../services/PatternService.js';
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
    <pre class="notes" style="transform:translateY({scrollPos})">{data.slice(2).map(note => `${getNoteName([1 + note | 0])} ${((note % 1) * 100).toFixed().padStart(2,'0')}`).join('\n')}</pre>
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
  text-align: center;
  text-align-last: justify;
  line-height:18px;
  width:100%;
  box-sizing:border-box;
}
.notes {
  pointer-events: none;
  position: absolute;
  top: 50%;
  margin: -8px 0 0 0;
  width:100%;
  min-width:0;
  padding:0 1em;
  background-image: linear-gradient( #0001 18px, transparent 18px);
  background-size:100% 72px;
  white-space: pre-line;
  will-change: transform;
  word-spacing: 4em;
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
</style>
