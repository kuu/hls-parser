const {MasterPlaylist, Variant, Rendition} = require('../../../types');

const renditions = createRendition();

function createRendition() {
  const renditions = [];
  renditions.push(new Rendition({
    type: 'AUDIO',
    uri: 'main/english-audio.m3u8',
    groupId: 'aac',
    language: 'en',
    name: 'English',
    isDefault: true,
    autoselect: true,
  }));
  renditions.push(new Rendition({
    type: 'AUDIO',
    uri: 'main/german-audio.m3u8',
    groupId: 'aac',
    language: 'de',
    name: 'Deutsch',
    isDefault: false,
    autoselect: true,
  }));
  renditions.push(new Rendition({
    type: 'AUDIO',
    uri: 'commentary/audio-only.m3u8',
    groupId: 'aac',
    language: 'en',
    name: 'Commentary',
    isDefault: false,
    autoselect: false,
  }));
  return renditions;
}

const playlist = new MasterPlaylist({
  variants: createVariants(),
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: 'low/video-only.m3u8',
    bandwidth: 1_280_000,
    codecs: 'mp4a.40.2',
    audio: renditions,
    currentRenditions: {audio: 0},
  }));
  variants.push(new Variant({
    uri: 'mid/video-only.m3u8',
    bandwidth: 2_560_000,
    codecs: 'mp4a.40.2',
    audio: renditions,
    currentRenditions: {audio: 0},
  }));
  variants.push(new Variant({
    uri: 'hi/video-only.m3u8',
    bandwidth: 7_680_000,
    codecs: 'mp4a.40.2',
    audio: renditions,
    currentRenditions: {audio: 0},
  }));
  variants.push(new Variant({
    uri: 'main/english-audio.m3u8',
    bandwidth: 65_000,
    codecs: 'mp4a.40.5',
    audio: renditions,
    currentRenditions: {audio: 0},
  }));
  return variants;
}

module.exports = playlist;
