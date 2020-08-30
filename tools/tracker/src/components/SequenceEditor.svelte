<script>
import { sequence, patterns, patternsMeta, currentPlaybackPosition } from '../stores.js';
import { createEventDispatcher } from 'svelte';
import { getCumlativeRowAtPosition} from '../services/SequenceService.js'
import Field from './Field.svelte';
import Button from './Button.svelte';
import Toolbar from './Toolbar.svelte';
import Pane from './Pane.svelte';

export let selectedPosition = 0;

const dispatch = createEventDispatcher();

const handleAddClick = () => {
  $sequence = [...$sequence, 0];
  selectedPosition = $sequence.length - 1;
  dispatch('select');
}

const handleDeleteClick = () => {
  $sequence = [...$sequence.slice(0, selectedPosition), ...$sequence.slice(selectedPosition + 1)];
  selectedPosition = Math.min(selectedPosition, $sequence.length - 1);
}

const select = position => {
  selectedPosition = position;
  dispatch('select');
}

const moveLeft = () => {
  $sequence = [
    ...$sequence.slice(0, selectedPosition - 1),
    $sequence[selectedPosition],
    $sequence[selectedPosition-1],
    ...$sequence.slice(selectedPosition + 1)
  ];
  selectedPosition--;
}

const moveRight = () => {
  $sequence = [
    ...$sequence.slice(0, selectedPosition),
    $sequence[selectedPosition+1],
    $sequence[selectedPosition],
    ...$sequence.slice(selectedPosition + 2)
  ];
  selectedPosition++;
}

$: hasSelection = selectedPosition !== null;

//$: currentPlaybackPosition.set(getCumlativeRowAtPosition(selectedPosition));

const color = seq => `hsl(${90+seq*20},35%,50%)`;

</script>

<Pane>
  <div slot="head">
    <Toolbar>
      <Field label="Sequence">
        <Button label="Add" on:click={handleAddClick} />
        <Button label="Delete" disabled={!hasSelection} on:click={handleDeleteClick} />
        <Button label="Move Left" disabled={!hasSelection || selectedPosition === 0} on:click={moveLeft} />
        <Button label="Move Right" disabled={!hasSelection || selectedPosition === $sequence.length - 1}  on:click={moveRight} />
      </Field>
      <div class="outset"></div>
    </Toolbar>
  </div>

  <div class="sequence">
    <div class="sequence__patterns">
      {#if $currentPlaybackPosition >= 0}
        <div class="marker" style="transform:translateX({$currentPlaybackPosition}px"></div>
      {/if}
      {#each $sequence as sequence, i}
        <div on:click={()=>select(i)} class:selected={i === selectedPosition} class="pattern" style="background: { color(sequence) }; max-width: { $patterns[sequence][0].length - 2 }px;min-width: { $patterns[sequence][0].length - 2}px">
          {#if i === selectedPosition}
            <select class="select" bind:value={sequence} on:input>
              {#each $patterns as pattern, i}
                <option value={i}>{i}</option>
              {/each}
            </select>
          {:else}
            {sequence}
          {/if}
        </div>
      {/each}
    </div>
  </div>
</Pane>

<style>
  .sequence {
    overflow: auto;
    width: 100%;
  }
  .sequence__patterns {
    display: flex;
    padding: var(--field-padding);
    position: relative;
  }
  .pattern {
    text-align: center;
    border: 1px solid #0004;
    border-radius: 4px;
    padding: var(--field-padding);
  }
  .selected {
    border-color: var(--focus-ring-color);
    width: auto !important;
    line-height: inherit;
  }
  .marker {
    position:absolute;
    width:3px;
    top:0;
    bottom:0;
    margin-left:-1px;
    background:#f008;
  }
</style>