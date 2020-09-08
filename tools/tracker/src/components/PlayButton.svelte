<script>
  import Button from './Button.svelte';

  export let disabled = false;
  export let keyboard = '';
  export let playing = false;
</script>

<Button on:click label={playing ? 'Stop' : 'Play'} {disabled} {keyboard} />
