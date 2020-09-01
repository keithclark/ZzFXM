<div class="toolbar">
  <slot/>
</div>

<style>
  .toolbar {
    display: flex;
  }
  .toolbar :global(.field) {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar > :global(:last-child) {
    flex: 1;
  }
  .toolbar :global(.field__controls) {
    width: fit-content;
  }
</style>
