<script>
  import { createElementId } from '../services/DomService.js';

  export let label = '';
  export let hint = null;

  let id = createElementId();
</script>

<div class="property outset" title={hint}>
  <label for={id} class="property__label embossed">{ label }</label>
  <span class="property__controls inset">
    <slot {id} />
  </span>
</div>

<style>
  .property {
    display: flex;
    padding: var(--field-padding);
    align-items: center;
  }
  .property__label {
    flex: 1;
    white-space: nowrap;
    padding-right:6px;
  }
  .property__controls {
    display: inline-flex;
  }
</style>
