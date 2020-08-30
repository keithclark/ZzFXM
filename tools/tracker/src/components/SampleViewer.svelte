<script>
import { onMount } from "svelte";

let canvas;

export let data;

$: data,generateSampleView();

const resize = () => {
  canvas.height = 0;
  canvas.width = 0;
  requestAnimationFrame(() => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    generateSampleView();
  });
}

const generateSampleView = () => {
  if (!canvas) {
    return;
  }
  const context = canvas.getContext('2d');
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  context.strokeStyle = '#0004';
  context.clearRect(0, 0, width, height);
  context.beginPath();

  context.moveTo(0, height / 2 - .5);
  context.lineTo(width, height / 2 -.5);
  context.stroke();
  context.closePath();

  context.strokeStyle = '#070';
  context.beginPath();
  for (let c = 0; c < width; c += 2) {
    const p = c * (data.length / width) | 0;
    const y = (.5 + data[p]) * height | 0;
    if (c === 0) {
      context.moveTo(0, y);
    } else {
      context.lineTo(c - .5, y);
    }
  }
  context.stroke();
  context.closePath();
}

onMount(resize);
</script>

<canvas bind:this={canvas}></canvas>
<svelte:window on:resize={resize} />
