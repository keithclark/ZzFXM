/**
 * This plugin encodes the song pattern data into string data.
 */

/**
 * Encode pattern data into string
 * @param {ZzfxmSongFacade} facade
 */
const execute = facade => {
  // TODO: Figure a better way of doing this - accessing _data is a hack.
  facade._data[1] = facade._data[1].map(pattern => {
    return pattern.map(channel => {
      // for RLE:
      // return channel.flat().map(x=>String.fromCharCode(x | 64)).join('').replace(/(.)(\1{1,62})/g, (m,c,r) => c + String.fromCharCode(61) + String.fromCharCode(r.length|64));
      return [...channel].flat().map(x=>String.fromCharCode(x | 64)).join('');
    });
  });
}

const postProcess = songString => {
  return songString.replace(/(\[\[".*"\]\])/, '$1.map(v=>v.map(v=>[...v].map(x=>x.charCodeAt()&63)))');
  // for RLE:
  // song = song.replace(/(\[\[".*"\]\])/, '$1.map(v=>v.map(v=>[...(v.replace(/.=./g,x=>x[0].repeat(x.charCodeAt(2)-63)))].map(x=>x.charCodeAt()&63)))');
}

export default {
  name: "Encode pattern data",
  execute,
  postProcess
};
