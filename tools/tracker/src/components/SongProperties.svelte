<script>
  import { currentPlaybackLength, speed, title, meta } from '../stores';
  import { serializeSong } from '../services/SongService.js';
  import { onMount } from 'svelte';

  import PropertyList from './PropertyList.svelte';
  import Property from './Property.svelte';
  import TextProperty from './TextProperty.svelte';

  let duration = '?';
  let size = '?';

  onMount(() => {
    duration = Math.floor($currentPlaybackLength * (125 / $speed) / 8.47);
    size = serializeSong().length;
  });
</script>


<PropertyList label="Metadata">
  <TextProperty size={40} hint="The name of the song" label="Title" bind:value={$title} />
  <TextProperty size={40} hint="The name of the composer" label="Author" bind:value={$meta.author} />
  <TextProperty size={40} hint="The URL of the composer" label="Author URL" bind:value={$meta.authorUrl} />
  <TextProperty size={40} hint="Notes about the song" label="Notes" bind:value={$meta.notes} multiline />
  <TextProperty size={4} hint="The license of the song" label="License" bind:value={$meta.license} />
</PropertyList>
<PropertyList label="Properties">
  <Property label="Playback time"><span class="output">{duration} seconds</span></Property>
  <Property label="Raw file size"><span class="output">{size} bytes</span></Property>
</PropertyList>
