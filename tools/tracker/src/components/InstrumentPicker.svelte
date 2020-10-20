<script>
import { playSound } from '../services/RendererService';
import { createEventDispatcher } from 'svelte';
import Button from './Button.svelte';
import { percussion, keyboards, wind } from 'zzfxm-instruments';

const dispatch = createEventDispatcher();

const format = v => {
  return v.substr(0,1).toUpperCase() + v.substr(1).replace(/[A-Z0-9]/g, ' $&')
}

const instruments = Object.entries({percussion, keyboards, wind}).map(([name, items]) => ({
  label: format(name),
  instruments: Object.entries(items).map(([name, value]) => ({
      name: format(name),
      params: value
    })
  )
}));

let group = instruments[0];
let selection = null;


const handleChange = () => {
  if (selection) {
    playSound(selection.params);
  }
};

const handleApplyClick = () => {
  dispatch('apply', selection);
};
</script>

<div class="wrap">
  <div class="splitView">
    <div class="inset">
      <select class="select" size="2" bind:value={group}>
        {#each instruments as group}
          <option value={group}>{group.label}</option>
        {/each}
      </select>
    </div>
    <div class="inset">
      <select class="select" size="2" bind:value={selection} on:change={handleChange}>
        {#each group.instruments as instrument (instrument)}
          <option value={instrument}>{instrument.name}</option>
        {/each}
      </select>
    </div>
  </div>
  <div>
    <Button label="Apply" disabled={!selection} on:click={handleApplyClick} />
  </div>
</div>

<style>
.wrap {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: var(--modal-spacing);
}
.splitView,.select {
  width:100%;
  height:100%;
}
.splitView {
  height: 20em;
}
</style>