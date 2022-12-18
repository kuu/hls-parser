const {MasterPlaylist, Variant, Rendition} = require('../../../types');

const renditions = {
  aud1: [
    new Rendition({
      type: 'AUDIO',
      uri: 'a1/prog_index.m3u8',
      groupId: 'aud1',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      channels: '2',
    }),
  ],
  aud2: [
    new Rendition({
      type: 'AUDIO',
      uri: 'a2/prog_index.m3u8',
      groupId: 'aud2',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      channels: '6',
    }),
  ],
  aud3: [
    new Rendition({
      type: 'AUDIO',
      uri: 'a3/prog_index.m3u8',
      groupId: 'aud3',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      channels: '6',
    }),
  ],
  cc1: [
    new Rendition({
      type: 'CLOSED-CAPTIONS',
      groupId: 'cc1',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      instreamId: 'CC1',
    }),
  ],
  sub1: [
    new Rendition({
      type: 'SUBTITLES',
      uri: 's1/en/prog_index.m3u8',
      groupId: 'sub1',
      language: 'en',
      name: 'English',
      autoselect: true,
      isDefault: true,
      forced: false,
    }),
  ],
};

const playlist = new MasterPlaylist({
  version: 6,
  independentSegments: true,
  variants: createVariants(),
});

function createVariants() {
  const variants = [];
  variants.push(new Variant({
    uri: 'v5/prog_index.m3u8',
    bandwidth: 2_227_464,
    averageBandwidth: 2_218_327,
    codecs: 'avc1.640020,mp4a.40.2',
    resolution: {width: 960, height: 540},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v9/prog_index.m3u8',
    bandwidth: 8_178_040,
    averageBandwidth: 8_144_656,
    codecs: 'avc1.64002a,mp4a.40.2',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v8/prog_index.m3u8',
    bandwidth: 6_453_202,
    averageBandwidth: 6_307_144,
    codecs: 'avc1.64002a,mp4a.40.2',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v7/prog_index.m3u8',
    bandwidth: 5_054_232,
    averageBandwidth: 4_775_338,
    codecs: 'avc1.64002a,mp4a.40.2',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v6/prog_index.m3u8',
    bandwidth: 3_289_288,
    averageBandwidth: 3_240_596,
    codecs: 'avc1.640020,mp4a.40.2',
    resolution: {width: 1280, height: 720},
    frameRate: 60.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v4/prog_index.m3u8',
    bandwidth: 1_296_989,
    averageBandwidth: 1_292_926,
    codecs: 'avc1.64001e,mp4a.40.2',
    resolution: {width: 768, height: 432},
    frameRate: 30.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v3/prog_index.m3u8',
    bandwidth: 922_242,
    averageBandwidth: 914_722,
    codecs: 'avc1.64001e,mp4a.40.2',
    resolution: {width: 640, height: 360},
    frameRate: 30.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v2/prog_index.m3u8',
    bandwidth: 553_010,
    averageBandwidth: 541_239,
    codecs: 'avc1.640015,mp4a.40.2',
    resolution: {width: 480, height: 270},
    frameRate: 30.0,
    audio: renditions.aud1,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v5/prog_index.m3u8',
    bandwidth: 2_448_841,
    averageBandwidth: 2_439_704,
    codecs: 'avc1.640020,ac-3',
    resolution: {width: 960, height: 540},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v9/prog_index.m3u8',
    bandwidth: 8_399_417,
    averageBandwidth: 8_366_033,
    codecs: 'avc1.64002a,ac-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v8/prog_index.m3u8',
    bandwidth: 6_674_579,
    averageBandwidth: 6_528_521,
    codecs: 'avc1.64002a,ac-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v7/prog_index.m3u8',
    bandwidth: 5_275_609,
    averageBandwidth: 4_996_715,
    codecs: 'avc1.64002a,ac-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v6/prog_index.m3u8',
    bandwidth: 3_510_665,
    averageBandwidth: 3_461_973,
    codecs: 'avc1.640020,ac-3',
    resolution: {width: 1280, height: 720},
    frameRate: 60.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v4/prog_index.m3u8',
    bandwidth: 1_518_366,
    averageBandwidth: 1_514_303,
    codecs: 'avc1.64001e,ac-3',
    resolution: {width: 768, height: 432},
    frameRate: 30.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v3/prog_index.m3u8',
    bandwidth: 1_143_619,
    averageBandwidth: 1_136_099,
    codecs: 'avc1.64001e,ac-3',
    resolution: {width: 640, height: 360},
    frameRate: 30.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v2/prog_index.m3u8',
    bandwidth: 774_387,
    averageBandwidth: 762_616,
    codecs: 'avc1.640015,ac-3',
    resolution: {width: 480, height: 270},
    frameRate: 30.0,
    audio: renditions.aud2,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v5/prog_index.m3u8',
    bandwidth: 2_256_841,
    averageBandwidth: 2_247_704,
    codecs: 'avc1.640020,ec-3',
    resolution: {width: 960, height: 540},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v9/prog_index.m3u8',
    bandwidth: 8_207_417,
    averageBandwidth: 8_174_033,
    codecs: 'avc1.64002a,ec-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v8/prog_index.m3u8',
    bandwidth: 6_482_579,
    averageBandwidth: 6_336_521,
    codecs: 'avc1.64002a,ec-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v7/prog_index.m3u8',
    bandwidth: 5_083_609,
    averageBandwidth: 4_804_715,
    codecs: 'avc1.64002a,ec-3',
    resolution: {width: 1920, height: 1080},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v6/prog_index.m3u8',
    bandwidth: 3_318_665,
    averageBandwidth: 3_269_973,
    codecs: 'avc1.640020,ec-3',
    resolution: {width: 1280, height: 720},
    frameRate: 60.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v4/prog_index.m3u8',
    bandwidth: 1_326_366,
    averageBandwidth: 1_322_303,
    codecs: 'avc1.64001e,ec-3',
    resolution: {width: 768, height: 432},
    frameRate: 30.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v3/prog_index.m3u8',
    bandwidth: 951_619,
    averageBandwidth: 944_099,
    codecs: 'avc1.64001e,ec-3',
    resolution: {width: 640, height: 360},
    frameRate: 30.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v2/prog_index.m3u8',
    bandwidth: 582_387,
    averageBandwidth: 570_616,
    codecs: 'avc1.640015,ec-3',
    resolution: {width: 480, height: 270},
    frameRate: 30.0,
    audio: renditions.aud3,
    subtitles: renditions.sub1,
    closedCaptions: renditions.cc1,
  }));
  variants.push(new Variant({
    uri: 'v7/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 186_522,
    averageBandwidth: 182_077,
    codecs: 'avc1.64002a',
    resolution: {width: 1920, height: 1080},
  }));
  variants.push(new Variant({
    uri: 'v6/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 133_856,
    averageBandwidth: 129_936,
    codecs: 'avc1.640020',
    resolution: {width: 1280, height: 720},
  }));
  variants.push(new Variant({
    uri: 'v5/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 98_136,
    averageBandwidth: 94_286,
    codecs: 'avc1.640020',
    resolution: {width: 960, height: 540},
  }));
  variants.push(new Variant({
    uri: 'v4/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 76_704,
    averageBandwidth: 74_767,
    codecs: 'avc1.64001e',
    resolution: {width: 768, height: 432},
  }));
  variants.push(new Variant({
    uri: 'v3/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 64_078,
    averageBandwidth: 62_251,
    codecs: 'avc1.64001e',
    resolution: {width: 640, height: 360},
  }));
  variants.push(new Variant({
    uri: 'v2/iframe_index.m3u8',
    isIFrameOnly: true,
    bandwidth: 38_728,
    averageBandwidth: 37_866,
    codecs: 'avc1.640015',
    resolution: {width: 480, height: 270},
  }));
  return variants;
}

module.exports = playlist;
