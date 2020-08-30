<script>
import { instrumentsMeta, patterns, instruments } from '../stores.js';
import { playNote } from '../services/RendererService.js';
import { addInstrument, deleteInstrument, setInstrumentParams } from '../services/InstrumentService.js';
import { decodeInstrument, encodeInstrument } from 'zzfxm-song-encoder';
import { clamp } from '../lib/utils.js';
import Pane from './Pane.svelte';
import Toolbar from './Toolbar.svelte';
import Button from './Button.svelte';
import Field from './Field.svelte';
import Property from './Property.svelte';
import TextProperty from './TextProperty.svelte';
import NumberProperty from './NumberProperty.svelte';
import SampleViewer from './SampleViewer.svelte';
import InstrumentPicker from './InstrumentPicker.svelte';

export let selected = 0;

const shapeOptions = [
  {id: 0, label: 'Sin'},
  {id: 1, label: 'Triangle'},
  {id: 2, label: 'Saw'},
  {id: 3, label: 'Tan'},
  {id: 4, label: 'Bit Noise'},
];

let clipboard;
let showInstrumentPicker = false;

$: selected = clamp(selected, 0, $instruments.length - 1);
$: instrument = $instruments[selected];
$: instrumentName = $instrumentsMeta[selected];
$: buffer = zzfxG(...instrument);
$: usage = $patterns.map((pattern, i) => {
  return pattern.some(channel => channel[0] === selected) && i
}).filter(x => x !== false);

const handlePlayClick = () => {
  playNote(selected, 1);
}

const handleChange = () => {
  playNote(selected, 1);
}

const handleImportClick = () => {
  let code = prompt('Zzfx Code', `zzfx(...[])`);
  if (code) {
    code = code.replace(/zzfx\(\.\.\.(\[[\w\W]*?\])\)/, '$1');
    setInstrumentParams(selected, decodeInstrument(code));
  }
}

const handleExportClick = () => {
  prompt('Zzfx Code', `zzfx(...${encodeInstrument(instrument)})`);
}

const handleAddClick = () => {
  addInstrument([1,0]);
  selected = $instruments.length - 1;
}

const handleDeleteClick = () => {
  if (usage.length > 0) {
    alert(`This instrument is being used in patterns ${usage}.`)
  } else {
    deleteInstrument(selected);
    selected = Math.min(selected,$instruments.length - 1);
  }
}

const handleSelectClick = () => {
  showInstrumentPicker = true;
}

const handleInstrumentSelect = e => {
  setInstrumentParams(selected, e.detail.params)
  $instrumentsMeta[selected] = e.detail.name
}

const copy = () => {
  clipboard = instrument.slice();
}

const paste = () => {
  $instruments[selected] = clipboard.slice();
  $instruments = $instruments;
}
</script>


<div class="splitView">
  <Pane>
    <div slot="head">
      <Toolbar>
        <Field label="Instruments">
          <Button label="Add" on:click={handleAddClick} />
          <Button label="Delete" disabled={usage.length} on:click={handleDeleteClick} />
          <Button label="Copy" on:click={copy}  />
          <Button label="Paste" on:click={paste} disabled={!clipboard} />
        </Field>
      </Toolbar>
    </div>
    <select class="select" bind:value={selected} size="2">
      {#each $instrumentsMeta as instrument, i}
        <option value={i}>{i}: {instrument}</option>
      {/each}
    </select>
  </Pane>

  <Pane>
    <div slot="head">
      <Toolbar>
        <NumberProperty min={0} max={$instruments.length - 1} label="#" bind:value={selected} />
        <TextProperty label="Name" bind:value={$instrumentsMeta[selected]} />
        <Field label="Playback">
          <Button label="Play Instrument" on:click={handlePlayClick} />
        </Field>
        <Field label="Parameters">
          <Button label="Import" on:click={handleImportClick} />
          <Button label="Export" on:click={handleExportClick} />
          <Button label="Library" on:click={handleSelectClick} />
        </Field>
        <Field label="Pattern Usage"><span class="usage input">{usage}</span></Field>
        <div class="outset"></div>
      </Toolbar>
    </div>

    <div class="instrument">
      <div class="instrument__params">
        <NumberProperty size={4} label="Volume" hint="Volume scale (percent)" min="0" max="1000000000" step="0.1" on:input={handleChange} bind:value={instrument[0]} />
        <NumberProperty size={4} label="Frequency" hint="Frequency of sound (Hz)" min="-1000000000" max="1000000000" step="1" on:input={handleChange} bind:value={instrument[2]} />
        <Property label="Shape">
          <select class="select" bind:value={instrument[6]}>
            {#each shapeOptions as option}
              <option value={option.id}>{option.label}</option>
            {/each}
          </select>
        </Property>
        <NumberProperty size={4} label="Attack" hint="Attack time, how fast sound starts (seconds)" min="0" max="3" step="0.01" on:input={handleChange} bind:value={instrument[3]} />
        <NumberProperty size={4} label="Sustain" hint="Sustain time, how long sound holds (seconds)" min="0" max="3" step="0.01" on:input={handleChange} bind:value={instrument[4]} />
        <NumberProperty size={4} label="Release" hint="Release time, how fast sound fades out (seconds)" min="0" max="3" step="0.01" on:input={handleChange} bind:value={instrument[5]} />
        <NumberProperty size={4} label="Shape Curve" hint="Squarenes of wave (0=square, 1=normal, 2=pointy)" min="0" max="1000000000" step="0.1" on:input={handleChange} bind:value={instrument[7]} />
        <NumberProperty size={4} label="Slide" hint="How much to slide frequency (kHz/s)" min="-1000000000" max="1000000000" step="0.1" on:input={handleChange} bind:value={instrument[8]} />
        <NumberProperty size={4} label="Delta Slide" hint="How much to change slide (kHz/s/s)" min="-1000000000" max="1000000000" step="0.1" on:input={handleChange} bind:value={instrument[9]} />
        <NumberProperty size={4} label="Pitch Jump" hint="Frequency of pitch jump (Hz)" min="-1000000000" max="1000000000" step="50" on:input={handleChange} bind:value={instrument[10]} />
        <NumberProperty size={4} label="Pitch Jump Time" hint="Time of pitch jump (seconds)" min="-1000000000" max="1000000000" step="0.01" on:input={handleChange} bind:value={instrument[11]} />
        <NumberProperty size={4} label="Repeat Time" hint="Resets some parameters periodically (seconds)" min="-1000000000" max="1000000000" step="0.01" on:input={handleChange} bind:value={instrument[12]} />
        <NumberProperty size={4} label="Noise" hint="How much random noise to add (percent)" min="-1000000000" max="1000000000" step="0.1" on:input={handleChange} bind:value={instrument[13]} />
        <NumberProperty size={4} label="Modulation" hint="Frequency of modulation wave, negative flips phase (Hz)" min="-1000000000" max="1000000000" step="0.1" on:input={handleChange} bind:value={instrument[14]} />
        <NumberProperty size={4} label="Bit Crush" hint="Resamples at a lower frequency in (samples*100)" min="-1000000000" max="1000000000" step="0.1" on:input={handleChange} bind:value={instrument[15]} />
        <NumberProperty size={4} label="Delay" hint="Overlap with itself for reverb and flanger effects (seconds)" min="0" max="1000000000" step="0.01" on:input={handleChange} bind:value={instrument[16]} />
        <NumberProperty size={4} label="Sustain Volume" hint="Volume level for sustain (percent)" min="0" max="1000000000" step="0.01" on:input={handleChange} bind:value={instrument[17]} />
        <NumberProperty size={4} label="Decay" hint="Decay time, how long to reach sustain after attack" min="0" max="1" step="0.01" on:input={handleChange} bind:value={instrument[18]} />
      </div>
      <div class="instrument__preview outset">
        <SampleViewer data={buffer} />
      </div>
    </div>
  </Pane>
</div>

<InstrumentPicker bind:open={showInstrumentPicker} on:select={handleInstrumentSelect} />

<style>
.instrument {
  display: flex;
}

.instrument__params {
  display: grid;
  grid-template-columns: repeat(3, 14em);
}

.instrument__preview {
  flex: 1;
}

.usage {
  min-width: 8em;
}
</style>