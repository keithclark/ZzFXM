<script>
  import { PATTERN_ROW_COARSE_STEP } from '../config.js';


  const isMac = navigator.userAgent.indexOf('Mac OS X') > -1;

  const SHIFT_KEY = '⇧';
  const ALT_KEY = isMac ? '⌥' : 'ALT';
  const UP_KEY = isMac ? '▲' : 'ꜛ';
  const DOWN_KEY = isMac ? '▼' : 'ꜜ';
  const SPACE_KEY = 'SPACE';
  const BACKSPACE_KEY = '←'
  const keymap = [
    {
      name: 'Playback',
      shortcuts: [
        { keys: ['ENTER'], desc: 'Play / Stop the current pattern' },
        { keys: [ALT_KEY, 'ENTER'], desc: 'Play / Stop song' },
        { keys: [SHIFT_KEY, 'ENTER'], desc: 'Play the current pattern from the beginning' },
        { keys: [ALT_KEY, SHIFT_KEY, 'ENTER'], desc: 'Play song from the beginning' },
      ]
    },
    {
      name: 'Editing',
      shortcuts: [
        { keys: [UP_KEY], desc: 'Move up one row in the pattern' },
        { keys: [DOWN_KEY], desc: 'Move down one row in the pattern' },
        { keys: [SHIFT_KEY, UP_KEY], desc: `Move up ${PATTERN_ROW_COARSE_STEP} rows in the pattern` },
        { keys: [SHIFT_KEY, DOWN_KEY], desc: `Move down ${PATTERN_ROW_COARSE_STEP} rows in the pattern` },
        { keys: [ALT_KEY, UP_KEY], desc: 'Increase note attenuation (fine)' },
        { keys: [ALT_KEY, DOWN_KEY], desc: 'Decrease note attenuation (fine)' },
        { keys: [ALT_KEY, SHIFT_KEY, UP_KEY], desc: 'Increase note attenuation (coarse)' },
        { keys: [ALT_KEY, SHIFT_KEY, DOWN_KEY], desc: 'Decrease note attenuation (coarse)' },
        { keys: [SPACE_KEY], desc: 'Release note'},
        { keys: [BACKSPACE_KEY], desc: 'Clear note'}

      ]
    }
  ];

</script>

{#each keymap as group}
  {group.name}
  <dl>
    {#each group.shortcuts as shortcut}
      <dt>
        {#each shortcut.keys as key, i}
          {#if i}&nbsp;+&nbsp;{/if}<kbd>{key}</kbd>
        {/each}
      </dt>
      <dd>{shortcut.desc}</dd>
    {/each}
  </dl>
{/each}


<style>
  kbd {
    padding: 2px 4px;
    background: #fff;
    box-shadow: 0 1px 0px 1px #888;
    border-radius: 2px;
    letter-spacing: 0;
    font: 12px / 1.25 Arial;
  }
  dl {
    display: grid;
    grid-template-columns: 15em auto;
    gap: var(--modal-spacing);
  }
  dt {
    word-spacing: -0.25em;
    width: auto;
    color: #444;
  }
  dd {
    margin:0;
  }
</style>