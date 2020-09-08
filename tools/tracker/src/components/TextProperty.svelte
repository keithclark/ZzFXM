<script>
  import Property from './Property.svelte';
  export let label = '';
  export let value = '';
</script>

<Property {label} let:id={id}>
  <input {id} spellcheck="false" type="text" class="input" bind:value={value}>
</Property>

<style>
  input {
    width:8em;
  }
</style>