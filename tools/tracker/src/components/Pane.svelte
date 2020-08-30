<div class="pane inset">
  <slot name="head" />
  <slot />
</div>

<style>
.pane > :global([slot="head"]) {
  --outset-color: var(--toolbar-color);
}
.pane {
  display: grid;
  grid-template-rows: auto 1fr auto;
}
</style>