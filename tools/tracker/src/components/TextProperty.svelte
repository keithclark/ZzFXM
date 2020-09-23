<script>
  import Property from './Property.svelte';
  export let label = '';
  export let value = '';
  export let hint = '';
  export let size = 14;
</script>

<Property {label} {hint} let:id={id}>
  <input {id} style="width: {size+1}ch" spellcheck="false" type="text" class="input" bind:value={value}>
</Property>
