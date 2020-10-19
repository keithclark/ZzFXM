<script>
  import Button from './Button.svelte';
  import { serializeSong, loadSongFromString } from '../services/SongService.js';
  import { createEventDispatcher, onMount } from 'svelte';

  let src;
  let error;

  const dispatch = createEventDispatcher()

  onMount(()=> {
    src = serializeSong();
    error = null;
  });

  const setClick = () => {
    try {
      loadSongFromString(src);
      dispatch('change');
    } catch (e) {
      error = e.message;
    }
  }
</script>

<div class="wrap">
  <div class="inset">
    <textarea class="inset input" bind:value={src}></textarea>
  </div>
  {#if error}
    <span>Error: {error}</span>
  {/if}
  <span>
    <Button label="Apply" on:click={setClick} />
  </span>
</div>


<style>
.wrap {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: var(--panel-spacing);
}
.inset {
  flex:1;
}
textarea {
  width: 100%;
  height: 100%;
  min-height:20em;
  white-space: pre-line;
  word-break: break-all;
  resize: none;
  display: block;
}
</style>
