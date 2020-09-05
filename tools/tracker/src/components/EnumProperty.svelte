<script>
  import Property from './Property.svelte';
  export let label = '';
  export let value = '';
  export let options = [];
  export let hint = '';
</script>

<Property {label} {hint} let:id={id}>
  <select {id} class="select" bind:value={value}>
    {#each options as option}
      <option>{option}</option>
    {/each}
  </select>
</Property>
