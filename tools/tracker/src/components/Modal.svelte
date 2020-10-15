<script>
import Button from './Button.svelte';
import { fade, fly } from 'svelte/transition';

export let open = false;
export let title = '';

const handleKeyPress = e => {
  if (!open) {
    return;
  }
  if (e.key === 'Escape') {
    close();
    e.preventDefault();
  }
};

const close = () => {
  open = false;
};
</script>

{#if open}
  <div class="overlay" transition:fade={{duration: 150}}></div>
  <dialog class="modal" transition:fly={{duration: 150, y: 10}}>
    <div class="modal__header outset embossed">
      {title} <Button label="×" on:click={close} />
    </div>
    <div class="modal__body outset"><slot /></div>
  </dialog>
{/if}

<svelte:window on:keydown={handleKeyPress}/>

<style>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 500px;
  max-height: calc(100vh - 32px);
  transform: translate(-50%,-50%);
  box-shadow: 0 2px 5px 2px #0008;
  display: grid;
  grid-template-rows: auto 1fr auto;
  z-index: 1;
  border: none;
  margin: 0;
  padding: 0;
}
.modal__header {
  padding: var(--modal-spacing);
}
.modal__header {
  --outset-color: var(--toolbar-color);
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}
.modal__body {
  padding: var(--panel-spacing);
  background: var(--body-color);
  overflow: auto;
}
.overlay {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0006;
}
</style>
