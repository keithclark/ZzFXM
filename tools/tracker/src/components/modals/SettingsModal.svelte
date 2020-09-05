<script>
  import {
    PLAYER_BUFFER_SIZE_OPTIONS,
    PLAYER_SAMPLE_RATE_OPTIONS,
    UI_FPS_OPTIONS
  } from '../../config.js';
  import { bufferSize, sampleRate, uiFPS } from '../../stores.js';

  import Modal from '../Modal.svelte';
  import PropertyList from '../PropertyList.svelte';
  import EnumProperty from '../EnumProperty.svelte';

  export let open = false;
</script>

<Modal title="Settings" bind:open>
  <PropertyList label="Playback Settings">
    <EnumProperty hint="The amount of data the player will prerender before playing it. Increase this if your browser is cutting off audio during playback" label="Playback buffer size (bytes)" bind:value={$bufferSize} options={PLAYER_BUFFER_SIZE_OPTIONS} />
    <EnumProperty hint="Controls the audio quality. Reduce in favour of UI responsiveness if your browser is consuming too many system resources" label="Playback sample rate (hz)" bind:value={$sampleRate} options={PLAYER_SAMPLE_RATE_OPTIONS} />
    <EnumProperty hint="Controls the responsiveness of the UI during playback. Reduce in favour of audio quality if your browser is consuming too many system resources" label="UI Refresh rate (FPS)" bind:value={$uiFPS} options={UI_FPS_OPTIONS} />
  </PropertyList>
</Modal>
