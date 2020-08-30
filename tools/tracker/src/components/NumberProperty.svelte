<script>

  import Property from './Property.svelte';

  export let label = '';
  export let value = 0;
  export let min = 0;
  export let max = 1;
  export let step = 1;
  export let size = 1;
  export let hint = '';

  let lastGoodValue = value;
  let elem;

  const setValue = e => {
    elem.value = value = lastGoodValue;
  }

  const setValueIfValid = e => {
    const newValue = parseFloat(elem.value);
    if (validateValue(newValue)) {
      lastGoodValue = value = newValue;
    } else {
      e.stopImmediatePropagation();
    }
  }

  const validateValue = value => {
    return !isNaN(value) && value >= min && value <= max;
  }

</script>

<Property {label} {hint} let:id={id}>
  <input {id} bind:this={elem} style="width: { size + 4 }ch" class="input" type="number" {step} {min} {max} value={value} on:focus={lastGoodValue=value} on:change={setValue} on:input={setValueIfValid} on:input on:change>
</Property>
