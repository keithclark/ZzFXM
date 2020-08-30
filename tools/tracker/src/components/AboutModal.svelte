<script>
  import Modal from './Modal.svelte';
  import { version, repository } from '../../package.json';
  export let open = false;
</script>

<Modal title="About" bind:open={open}>
  <div>
    <h1>ZzFXM Music Tracker</h1>
    v{ version }
    <p>by <a href="https://keithclark.co.uk">Keith Clark</a></p>
    <p>Source available at the <a href="{repository.url}">ZzFXM GitHub Repo</a></p>
  </div>
</Modal>

<style>
div {
  text-align: center;
}
</style>