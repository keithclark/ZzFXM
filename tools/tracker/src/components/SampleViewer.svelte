<script>
import { onDestroy, onMount } from "svelte";

let canvas;
let debounce = false;
let canvasWidth;
let canvasHeight;

export let data;

$: if (data){
  generateSampleView();
}


const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const {width, height} = entry.contentRect;
    canvasWidth = width;
    canvasHeight = height;

    if (!debounce) {
      debounce = true;
      generateSampleView();
      setTimeout(() => {
        generateSampleView();
        debounce = false;
      }, 500);
    }
  }
});


const generateSampleView = () => {
  if (!canvas) {
    return
  }
  const context = canvas.getContext('2d');
  canvas.height = canvasHeight;
  canvas.width = canvasWidth;
  context.strokeStyle = '#0004';
  context.beginPath();

  context.moveTo(0, canvasHeight / 2 - .5);
  context.lineTo(canvasWidth, canvasHeight / 2 -.5);
  context.stroke();
  context.closePath();

  context.strokeStyle = '#062';
  context.beginPath();
  for (let c = 0; c < canvasWidth; c += 2) {
    const p = c * (data.length / canvasWidth) | 0;
    const y = (.5 + data[p]) * canvasHeight | 0;
    if (c === 0) {
      context.moveTo(0, y);
    } else {
      context.lineTo(c - .5, y);
    }
  }
  context.stroke();
  context.closePath();
}

onMount(() => {
  resizeObserver.observe(canvas.parentElement);
});

onDestroy(() => {
  resizeObserver.unobserve(canvas.parentElement);
});

</script>

<div>
  <canvas class="inset" bind:this={canvas}></canvas>
</div>

<style>
  div {
    position: relative;
    width: 100%;
    height: 100%;
  }
  canvas {
    position:absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: var(--field-padding) solid var(--outset-color)
  }
</style>
