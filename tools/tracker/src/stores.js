import { writable } from 'svelte/store';


// Song
export const title = new writable('');
export const speed = new writable(125);
export const instruments = new writable([]);
export const instrumentsMeta = new writable([]);
export const patterns = new writable([]);
export const patternsMeta = new writable([]);
export const sequence = new writable([]);


// Selections
export const selectedRow = new writable();
export const selectedPattern = new writable(0);
export const selectedSequence = new writable(0);


// Audio
export const masterVolume = new writable(.5);
export const currentPlaybackPosition = new writable(0);
export const currentPlaybackLength = new writable(0);
export const channelMeters = new writable([]);
export const songPlaying = new writable(false);

