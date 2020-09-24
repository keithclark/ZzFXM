<script>
  import { currentPlaybackLength, speed, title, meta } from '../../stores';
  import { serializeSong } from '../../services/SongService.js';

  import Modal from '../Modal.svelte';
  import PropertyList from '../PropertyList.svelte';
  import Property from '../Property.svelte';
  import TextProperty from '../TextProperty.svelte';

  export let open = false;
  let size = 0;

  $: duration = Math.floor($currentPlaybackLength * (125 / $speed) / 8.47);
  $: if (open === true) {
    size = serializeSong().length;
  }

</script>


<Modal title="Song Properties" bind:open={open}>
  <PropertyList label="Metadata">
    <TextProperty hint="The name of the composer" size={30} label="Title" bind:value={$title}></TextProperty>
    <TextProperty hint="The name of the composer" size={30} label="Author" bind:value={$meta.author}></TextProperty>
    <TextProperty hint="The name of the composer" size={30} label="Author URL" bind:value={$meta.authorUrl}></TextProperty>
    <TextProperty hint="The name of the composer" size={4} label="License" bind:value={$meta.license}></TextProperty>
  </PropertyList>
  <PropertyList label="Properties">
    <Property label="Playback time"><span class="output">{duration} seconds</span></Property>
    <Property label="File size"><span class="output">{size} bytes</span></Property>
  </PropertyList>
</Modal>