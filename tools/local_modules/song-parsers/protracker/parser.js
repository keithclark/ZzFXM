/**
 * Protracker MOD parser
 */
const CHANNEL_PERIOD = 0;
const CHANNEL_INSTRUMENT = 1;
const CHANNEL_EFFECT_CODE = 2;
const CHANNEL_EFFECT_PARAM = 3;


/**
 *
 * @param {*} buffer
 */
const parseString = buffer => {
  return String.fromCharCode(...buffer.filter(c=>c)).trim()
};


/**
 *
 * @param {*} buffer
 */
const parseSampleMeta = buffer => ({
  name: parseString(buffer.slice(0, 21)),
  size: ((buffer[22] << 8) + buffer[23]) * 2,
  finetune: buffer[24],
  volume: buffer[25],
  loopStart: (buffer[26] << 8) + buffer[27],
  loopEnd: (buffer[28] << 8) + buffer[29]
});


/**
 *
 * @param {Uint8Array} buffer
 */
const parseSequences = buffer => {
  const length = buffer[950];
  return [...buffer.slice(952, 952 + length)];
};


/**
 *
 * @param {Uint8Array} buffer
 * @param {*} sampleCount
 */
const parseSamples = (buffer, sampleCount) => {
  return Array.from({length: sampleCount}).map((v, index) => {
    const start = index * 30 + 0x14;
    return parseSampleMeta(buffer.slice(start, start + 30));
  })
};


/**
 *
 * @param {Uint8Array} buffer
 */
const parseChannelData = buffer => {
  const data = (buffer[0] << 24) + (buffer[1] << 16) + (buffer[2] <<8 ) + buffer[3];
  const period = (data >> 16) & 0x0fff;
  const instrument = (data >> 24) & 0xf0 | (data >> 12) & 0x0f;
  const effect = (data >> 8) & 0x0f;
  const param = data & 0xff;
  return [period, instrument, effect, param];
};


/**
 *
 * @param {Uint8Array} buffer
 */
export const parse = (buffer, cb) => {
  let sampleCount;
  let channelCount;
  let samples = [];
  let offset = 0;

  const format = parseString(buffer.slice(0x438, 0x43c));

  if (format === 'M.K.') {
    sampleCount = 31;
    channelCount = 4;
  } else {
    throw new Error('Unknown format');
  }

  const sequence = parseSequences(buffer);
  const patternCount = Math.max(...sequence);

  cb({type: 'title', value: parseString(buffer.slice(0, 0x14))});
  cb({type: 'channelCount', value: channelCount});
  cb({type: 'sequence', value: sequence})

  parseSamples(buffer, sampleCount).forEach((sample, i) => {
    samples.push(sample);
    cb({type: 'sampleMeta', value: sample});
  });

  offset = 1084;

  for (let pattern = 0; pattern <= patternCount; pattern++) {
    cb({type: 'pattern', value: pattern})
    for (let row = 0; row < 64; row++) {
      cb({type: 'row', value: row})
      for (let channel = 0; channel < channelCount; channel++) {
        cb({type: 'channel', value: channel})
        const channelData = parseChannelData(buffer.slice(offset, offset + 4));
        cb({type: 'notePeriod', value: channelData[CHANNEL_PERIOD]});
        cb({type: 'noteInstrument', value: channelData[CHANNEL_INSTRUMENT]});
        cb({type: 'noteEffectCode', value: channelData[CHANNEL_EFFECT_CODE]});
        cb({type: 'noteEffectParam', value: channelData[CHANNEL_EFFECT_PARAM]});
        cb({type: 'channelEnd', value: channel})
        offset += 4;
      }
      cb({type: 'rowEnd', value: row});
    }
    cb({type: 'patternEnd', value: pattern});
  }

  samples.forEach((sample, i) => {
    cb({ type: 'sampleData', value: buffer.slice(offset, offset + sample.size) });
    offset += sample.size;
  });
}
