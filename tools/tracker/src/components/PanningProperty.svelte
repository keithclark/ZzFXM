<script>
import Slider from './Slider.svelte';

export let value = 0;
</script>

<div>
  <Slider step={.1} min={-1} max={1} list="stops" bind:value />
  <datalist id="stops">
    <option value="-1" label="L">
    <option value="0" label="C">
    <option value="1" label="R">
  </datalist>
</div>

<style>
  datalist {
    display: flex;
    justify-content: space-between;
    padding: 0 14px;
  }
  option {
    font-size: 80%;
    padding:0 2px
  }
</style>
