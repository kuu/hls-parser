const test = require('ava');
const HLS = require('../../..');
const utils = require('../../helpers/utils');

// Allow indipendent EXT-X-CUE-IN
test('#EXT-X-CUE-IN_01', t => {
  const {MediaPlaylist, Segment} = HLS.types;

  const ads = [...new Array(3)].map((_, i) => new Segment({uri: `https://example.com/${i}.ts`, duration: 10}));
  ads[0].discontinuity = true;
  ads[0].markers.push({type: 'OUT', duration: 30});

  const empty = new Segment();
  empty.markers.push({type: 'IN'});

  const playlist = new MediaPlaylist({
    targetDuration: 10,
    segments: [...ads, empty]
  });

  const expected = `
    #EXTM3U
    #EXT-X-TARGETDURATION:10
    #EXT-X-DISCONTINUITY
    #EXT-X-CUE-OUT:30
    #EXTINF:10,
    https://example.com/0.ts
    #EXTINF:10,
    https://example.com/1.ts
    #EXTINF:10,
    https://example.com/2.ts
    #EXT-X-CUE-IN
  `;

  t.is(HLS.stringify(playlist), utils.stripCommentsAndEmptyLines(expected));
});
