<script>
  import { createElementId } from '../services/DomService.js';

  export let label = '';
  export let hint = null;

  let id = createElementId();
</script>

<div class="field outset" title={hint}>
  <label for={id} class="field__label embossed">{ label }</label>
  <span class="field__controls inset">
    <slot {id} />
  </span>
</div>

<style>
  .field {
    display: flex;
    padding: var(--field-padding);
    align-items: center;
  }
  .field__label {
    flex: 1;
    text-indent: 2px;
  }
  .field__controls {
    display: inline-flex;
  }
</style>
