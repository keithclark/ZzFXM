<script>

  import Property from './Property.svelte';

  export let label = '';
  export let value = 0;
  export let min = 0;
  export let max = 1;
  export let step = 1;
  export let size = 1;
  export let hint = '';

  const fineStep = step;
  const coarseStep = step * 10;

  let lastGoodValue = value;
  let elem;

  const setValue = () => {
    elem.value = value = lastGoodValue;
  }

  const setValueIfValid = event => {
    const newValue = parseFloat(elem.value);
    if ((newValue === 0 && elem.value.length > 1) || !validateValue(newValue)) {
      event.stopImmediatePropagation();
      return;
    }
    lastGoodValue = value = newValue;
  }

  const validateValue = value => {
    return !isNaN(value) && value >= min && value <= max;
  }

  const handleKeyDown = event => {
    if (event.shiftKey) {
      step = coarseStep;
    } else {
      step = fineStep;
    }
  }
</script>

<Property {label} {hint} let:id={id}>
  <input {id} bind:this={elem} style="width: { size + 4 }ch" class="input" type="number" {step} {min} {max} value={value} on:focus={lastGoodValue=value} on:keydown={handleKeyDown} on:change={setValue} on:input={setValueIfValid} on:input on:change>
</Property>
