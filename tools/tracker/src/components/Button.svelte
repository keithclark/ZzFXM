<script>
export let hint = '';
export let label = '';
export let disabled = false;
export let keyboard = '';

let title;

$: if (hint && keyboard) {
  title = `${hint}\n\nShortcut: ${keyboard}`;
} else if (hint) {
  title = `${hint}`;
} else if (keyboard) {
  title = `Shortcut: ${keyboard}`;
}
</script>

<button class="outset" {disabled} {title} on:click>{ label }</button>

<style>
  button {
    background-color: var(--button-color);
    border: none;
    display: inline-block;
    padding: var(--input-padding) 8px;
    font: inherit;
    text-transform: uppercase;
    margin: 0;
    white-space: nowrap;
    letter-spacing: inherit;
  }
  button[disabled] {
    color:#0005;
  }
  button:not([disabled]):hover {
    background-color: var(--button-color-hover);
  }
  button:not([disabled]):active {
    background-color: var(--button-color-press);
  }
</style>