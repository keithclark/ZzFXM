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
    white-space: nowrap;
  }
  .field__controls {
    display: inline-flex;
    flex-wrap: wrap;
  }
  .field__controls > :global(*) {
    flex: 1
  }
</style>
