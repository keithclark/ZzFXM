<script>
import Button from './Button.svelte';

  export let label = '';
  export let disabled = false;
  export let keyboard = '';
  export let checked = false;

  const handleToggleClick = () => {
    checked = !checked;
  }
</script>

<span class:checked class="toggleButton">
  <Button on:click on:click={handleToggleClick} {label} {disabled} {keyboard} />
</span>

<style>
  .toggleButton {
    display: inline-flex;
  }
  .toggleButton > :global(*) {
    flex: 1;
  }
  .toggleButton > :global(*)::before {
    content: '';
    display: inline-block;
    border-radius: 8px;
    width: 8px;
    height: 8px;
    margin-right: 4px;
    background-color: var(--indicator-color);
    box-shadow: .5px .5px 0px .5px #fff4, -.5px -.5px 0px .5px #0004, inset 1px 1px 0 0 #fff9, inset -1px -1px 0 0 #0006;
    border: 1px solid #000c;
  }
  .toggleButton {
    --indicator-color: #333;
  }
  .checked {
    --indicator-color: #f35;
  }
</style>