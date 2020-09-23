<script>
  import Modal from '../Modal.svelte';
  import Button from '../Button.svelte';
  import { serializeSong, loadSongFromString } from '../../services/SongService.js';
  export let open = false;

  let src;
  let error;

  $: if (open) {
    src = serializeSong();
    error = null;
  }

  const setClick = () => {
    try {
      loadSongFromString(src);
      open = false;
    } catch (e) {
      error = e.message;
    }
  }
</script>

<Modal title="Source" bind:open={open}>
  <div class="wrap">
    <div class="inset">
      <textarea class="inset input" bind:value={src}></textarea>
    </div>
    {#if error}
      <span>Error: {error}</span>
    {/if}
  </div>
  <span slot="controls">
    <Button label="Apply" on:click={setClick} />
  </span>
</Modal>

<style>

.wrap {
  display:flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 20em;
}
.inset {
  flex:1;
}
textarea {
  width: 100%;
  height: 100%;
  white-space: pre-line;
  word-break: break-all;
  resize: none;
}
</style>