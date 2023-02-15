const {MasterPlaylist, Variant} = require('../../../types');

const playlist = new MasterPlaylist({
  variants: createVariants(),
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: 'low/audio-video.m3u8',
    bandwidth: 1_280_000,
    codecs: 'avc1.640029,mp4a.40.2',
  }));
  variants.push(new Variant({
    uri: 'low/iframe.m3u8',
    isIFrameOnly: true,
    bandwidth: 86_000,
    codecs: 'avc1.640029',
  }));
  variants.push(new Variant({
    uri: 'mid/audio-video.m3u8',
    bandwidth: 2_560_000,
    codecs: 'avc1.640029,mp4a.40.2',
  }));
  variants.push(new Variant({
    uri: 'mid/iframe.m3u8',
    isIFrameOnly: true,
    bandwidth: 150_000,
    codecs: 'avc1.640029',
  }));
  variants.push(new Variant({
    uri: 'hi/audio-video.m3u8',
    bandwidth: 7_680_000,
    codecs: 'avc1.640029,mp4a.40.2',
  }));
  variants.push(new Variant({
    uri: 'hi/iframe.m3u8',
    isIFrameOnly: true,
    bandwidth: 550_000,
    codecs: 'avc1.640029',
  }));
  variants.push(new Variant({
    uri: 'audio-only.m3u8',
    bandwidth: 65_000,
    codecs: 'mp4a.40.5',
  }));
  return variants;
}

module.exports = playlist;
