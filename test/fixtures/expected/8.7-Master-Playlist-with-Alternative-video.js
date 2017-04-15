const {URL} = require('url');
const {MasterPlaylist, Variant, Rendition} = require('../../../types');

function createRendition(groupId) {
  const renditions = [];
  renditions.push(new Rendition({
    type: 'VIDEO',
    uri: new URL(`http://node-hls-stream.com/${groupId}/main/audio-video.m3u8`),
    groupId,
    name: 'Main',
    isDefault: groupId === 'mid' ? false : true
  }));
  renditions.push(new Rendition({
    type: 'VIDEO',
    uri: new URL(`http://node-hls-stream.com/${groupId}/centerfield/audio-video.m3u8`),
    groupId,
    name: 'Centerfield',
    isDefault: groupId === 'mid' ? true : false
  }));
  renditions.push(new Rendition({
    type: 'VIDEO',
    uri: new URL(`http://node-hls-stream.com/${groupId}/dugout/audio-video.m3u8`),
    groupId,
    name: 'Dugout'
  }));
  return renditions;
}

const playlist = new MasterPlaylist({
  uri: new URL('http://node-hls-stream.com/8.7-Master-Playlist-with-Alternative-video.m3u8'),
  variants: createVariants(),
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/low/main/audio-video.m3u8'),
    bandwidth: 1280000,
    codecs: 'avc1.640029,mp4a.40.2',
    video: createRendition('low'),
    currentRenditions: {'VIDEO': 0}
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/mid/main/audio-video.m3u8'),
    bandwidth: 2560000,
    codecs: 'avc1.640029,mp4a.40.2',
    video: createRendition('mid'),
    currentRenditions: {'VIDEO': 1}
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/hi/main/audio-video.m3u8'),
    bandwidth: 7680000,
    codecs: 'avc1.640029,mp4a.40.2',
    video: createRendition('hi')
  }));
  return variants;
}

module.exports = playlist;
