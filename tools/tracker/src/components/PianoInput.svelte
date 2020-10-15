<script>
import { NOTE_KEY_CODES } from '../config.js';

$: keys = Object.entries(NOTE_KEY_CODES).sort((a,b) => a[1] - b[1]).map(([x]) => x);

const handleClick = event => {
  const { target, button } = event;
  if (button === 0) {
    target.focus()
    const event = new KeyboardEvent('keydown', {
      key: target.dataset.note
    });
    window.dispatchEvent(event);
  }
};
</script>

<div>
  {#each keys as key}
    <span tabindex="0" data-note={key} on:mousedown={handleClick}>
      {key.toUpperCase()}
    </span>
  {/each}
</div>

<style>
  div {
    display: flex;
    align-items: flex-start;
    padding: var(--modal-spacing);
  }
  span {
    padding-top: 76px;
    padding-bottom: 4px;
    background-color: #eee;
    color:#888;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    text-align: center;
    box-shadow: 0 0 0px 1px #0006;
    flex: 1;
  }
  span:nth-child(12n+2),
  span:nth-child(12n+4),
  span:nth-child(12n+7),
  span:nth-child(12n+9),
  span:nth-child(12n+11) {
    background-color: #222;
    padding-top: 40px;
    margin: 0 -11px;
    flex: .75;
    z-index: 1;
    box-shadow: 1px 1px 1px 1px #0006;
    margin: 0 -1.75%;
  }
  span:hover {
    filter:contrast(.7)
  }
  span + span {
    margin-left: 1px;
  }
</style>
