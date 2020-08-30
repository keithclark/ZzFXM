<script>
  export let label = ''
</script>

<div class="field outset">
  <span class="field__label">{ label }</span>
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
    color:#000a;
    text-shadow: 1px 1px 0 #fff6;
    text-indent:2px;
  }
  .field__controls {
    display: inline-flex;
  }
</style>
