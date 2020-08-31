<script>
import { NOTE_KEY_CODES } from '../config.js';

const getKeyMapForNote = note => {
  return Object.entries(NOTE_KEY_CODES).find(([key, index]) => index === note);
};

const handleClick = event => {
  const {target, button} = event;
  if (button === 0) {
    const event = new KeyboardEvent('keydown', {key: target.dataset.note});
    window.dispatchEvent(event);
  }
};
</script>

<div class="inset">
  {#each {length: 36} as _, i}
    <span data-note={getKeyMapForNote(i + 1)[0]} on:mousedown={handleClick}>
      {getKeyMapForNote(i + 1)[0].toUpperCase()}
    </span>
  {/each}
</div>

<style>
  div {
    display: flex;
    align-items: flex-start;
    padding: var(--field-padding);
    width:75%;
    margin: auto;
  }
  span {
    padding-top: 76px;
    padding-bottom: 4px;
    background-color: #eee;
    color:#666;
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
    color: #ccc;
    margin: 0 -1.75%;
  }
  span:hover {
    filter:contrast(.7)
  }
  span + span {
    margin-left: 1px;
  }
</style>
