<script>
  import Property from './Property.svelte';
  export let label = '';
  export let value = '';
  export let hint = '';
  export let size = 14;
  export let multiline = false;
</script>

<Property {label} {hint} let:id={id}>
  {#if multiline}
    <textarea {id} style="width: {size+1}ch" rows="5" spellcheck="false" class="input" bind:value={value}></textarea>
  {:else}
    <input {id} style="width: {size+1}ch" spellcheck="false" type="text" class="input" bind:value={value}>
  {/if}
</Property>

<style>
  textarea {
    resize: none;
  }
</style>
