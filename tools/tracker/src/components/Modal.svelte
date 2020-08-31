<script>
import Button from './Button.svelte';
import { fade, fly } from 'svelte/transition';

export let open = false;
export let title = '';
</script>

{#if open}
  <div class="overlay" transition:fade={{duration: 150}}></div>
  <div class="modal" transition:fly={{duration:150, y: 10}}>
    <div class="modal__header outset embossed">{title}</div>
    <div class="modal__body outset"><slot /></div>
    <div class="modal__footer outset">
      <Button label="Close" on:click={()=>open=false} />
      <slot name="controls"/>
    </div>
  </div>
{/if}

<style>
.modal {
  --panel-spacing: var(--modal-spacing);
  position: fixed;
  top: 50%;
  left: 50%;
  width: 500px;
  min-height: 340px;
  max-height: 400px;
  transform: translate(-50%,-50%);
  box-shadow: 0 2px 5px 2px #0008;
  display: grid;
  grid-template-rows: auto 1fr auto;
  z-index:1
}
.modal__header, .modal__footer {
  padding: var(--panel-spacing);
  text-align: center;
}
.modal__body {
  padding: var(--panel-spacing);
  overflow: auto
}
.overlay {
  content: '';
  position: fixed;
  top:0;
  left:0;
  right:0;
  bottom:0;
  background:#0006;
}

</style>
