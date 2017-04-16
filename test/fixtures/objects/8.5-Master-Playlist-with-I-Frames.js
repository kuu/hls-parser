const {URL} = require('url');
const {MasterPlaylist, Variant} = require('../../../types');

const playlist = new MasterPlaylist({
  uri: new URL('http://node-hls-stream.com/8.5-Master-Playlist-with-I-Frames.m3u8'),
  variants: createVariants(),
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/low/audio-video.m3u8'),
    bandwidth: 1280000,
    codecs: 'avc1.640029,mp4a.40.2'
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/low/iframe.m3u8'),
    isIFrameOnly: true,
    bandwidth: 86000,
    codecs: 'avc1.640029'
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/mid/audio-video.m3u8'),
    bandwidth: 2560000,
    codecs: 'avc1.640029,mp4a.40.2'
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/mid/iframe.m3u8'),
    isIFrameOnly: true,
    bandwidth: 150000,
    codecs: 'avc1.640029'
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/hi/audio-video.m3u8'),
    bandwidth: 7680000,
    codecs: 'avc1.640029,mp4a.40.2'
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/hi/iframe.m3u8'),
    isIFrameOnly: true,
    bandwidth: 550000,
    codecs: 'avc1.640029'
  }));
  variants.push(new Variant({
    uri: new URL('http://node-hls-stream.com/audio-only.m3u8'),
    bandwidth: 65000,
    codecs: 'mp4a.40.5'
  }));
  return variants;
}

module.exports = playlist;
