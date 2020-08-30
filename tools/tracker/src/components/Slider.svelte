<script>
  export let id = null;
  export let step = 1;
  export let min = 0;
  export let max = 1;
  export let list = null;
  export let value;
</script>

<input type="range" {id} {step} {min} {max} {list} bind:value>

<style>
  input {
    display: block;
    margin: 0;
    width: 100%;
    padding: 4px;
    height: 21px;
    background-color: transparent;
    -webkit-appearance: none;
  }
  input:focus {
    outline: none;
  }
  input::-webkit-slider-runnable-track {
    background: #777;
    box-shadow: inset -1px -1px 0 #fff8, inset 1px 1px 0 #0003;
    height: 6px;
  }
  input::-moz-range-track {
    background: #777;
    box-shadow: inset -1px -1px 0 #fff8, inset 1px 1px 0 #0003;
    height: 6px;
  }
  input::-webkit-slider-thumb {
    margin-top: -6px;
    width: 30px;
    height: 17px;
    background: linear-gradient(90deg,#555 13px,  #87e6eb 15px,  #555 17px);
    box-shadow: -1px -1px 0 #fff4, inset -1px -1px 0 #0004, 0px 1px 4px #000c;
    -webkit-appearance: none;
  }
  input::-moz-range-thumb {
    width: 30px;
    height: 17px;
    border: none;
    border-radius: 0;
    background: linear-gradient(90deg,#555 13px,  #87e6eb 15px,  #555 17px);
    box-shadow: -1px -1px 0 #fff4, inset -1px -1px 0 #0004, 0px 1px 4px #000c;
  }
</style>