<script>
  export let label = ''
</script>

<div class="field outset">
  <span class="field__label embossed">{ label }</span>
  <span class="field__controls inset">
    <slot />
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
    text-indent:2px;
  }
  .field__controls {
    display: inline-flex;
  }
</style>
