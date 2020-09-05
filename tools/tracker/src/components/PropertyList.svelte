<script>
  export let label = '';
</script>

<div class="propertyList">
  <div class="propertyList__label">{ label }</div>
  <div class="propertyList__properties inset">
    <slot />
  </div>
</div>

<style>
  .propertyList + .propertyList {
    margin-top: var(--panel-spacing)
  }
  .propertyList__label {
    padding: var(--field-padding);
  }
</style>