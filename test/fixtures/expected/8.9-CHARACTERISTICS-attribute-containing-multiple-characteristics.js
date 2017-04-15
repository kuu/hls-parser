const {URL} = require('url');
const {MasterPlaylist, Variant, Rendition} = require('../../../types');

const renditions = createRendition();

function createRendition() {
  const renditions = [];
  renditions.push(new Rendition({
    type: 'AUDIO',
    uri: new URL('http://node-hls-stream.com/main/english-audio.m3u8'),
    groupId: 'aac',
    language: 'en',
    name: 'English',
    isDefault: true,
    autoselect: true,
    characteristics: 'public.accessibility.transcribes-spoken-dialog,public.easy-to-read'
  }));
  renditions.push(new Rendition({
    type: 'AUDIO',
    uri: new URL('http://node-hls-stream.com/main/german-audio.m3u8'),
    groupId: 'aac',
    language: 'de',
    name: 'Deutsch',
    autoselect: true,
    characteristics: 'public.accessibility.transcribes-spoken-dialog,public.easy-to-read'
  }));
  renditions.push(new Rendition({
    type: 'AUDIO',
    uri: new URL('http://node-hls-stream.com/commentary/audio-only.m3u8'),
    groupId: 'aac',
    language: 'en',
    name: 'Commentary',
    characteristics: 'public.accessibility.transcribes-spoken-dialog,public.easy-to-read'
  }));
  return renditions;
}

const playlist = new MasterPlaylist({
  uri: new URL('http://node-hls-stream.com/8.9-CHARACTERISTICS-attribute-containing-multiple-characteristics.m3u8'),
  variants: createVariants(),
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/low/video-only.m3u8'),
    bandwidth: 1280000,
    codecs: 'mp4a.40.2',
    audio: renditions,
    currentRenditions: {'AUDIO': 0}
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/mid/video-only.m3u8'),
    bandwidth: 2560000,
    codecs: 'mp4a.40.2',
    audio: renditions,
    currentRenditions: {'AUDIO': 0}
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/hi/video-only.m3u8'),
    bandwidth: 7680000,
    codecs: 'mp4a.40.2',
    audio: renditions,
    currentRenditions: {'AUDIO': 0}
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/main/english-audio.m3u8'),
    bandwidth: 65000,
    codecs: 'mp4a.40.5',
    audio: renditions,
    currentRenditions: {'AUDIO': 0}
  }));
  return variants;
}

module.exports = playlist;
