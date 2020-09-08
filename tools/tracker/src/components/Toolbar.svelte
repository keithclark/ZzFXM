<div class="toolbar">
  <slot/>
</div>

<style>
  .toolbar {
    display: flex;
  }
  .toolbar :global(.property), .toolbar :global(.field) {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar :global(.property__label), .toolbar :global(.field__label) {
    flex:0;
    padding-left: 2px;
    padding-right: 2px
  }
  .toolbar > :global(:last-child) {
    flex: 1;
  }
  .toolbar :global(.property__controls), .toolbar :global(.field__controls) {
    width: fit-content;
  }
</style>
