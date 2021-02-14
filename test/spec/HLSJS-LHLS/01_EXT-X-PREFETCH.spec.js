const test = require("ava");
const utils = require("../../helpers/utils");
const HLS = require("../../..");

test("#EXT-X-PREFETCH_01", t => {
  utils.bothPass(
    t,
    `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE: 0
    #EXT-X-DISCONTINUITY-SEQUENCE: 0
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:06.531Z
    #EXTINF:2.000
    https://foo.com/bar/0.ts
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:08.531Z
    #EXTINF:2.000
    https://foo.com/bar/1.ts

    #EXT-X-PREFETCH:https://foo.com/bar/2.ts
    #EXT-X-PREFETCH:https://foo.com/bar/3.ts
  `
  );
});

test("#EXT-X-PREFETCH_02", t => {
  const parsed = HLS.parse(`
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:2
    #EXT-X-MEDIA-SEQUENCE: 0
    #EXT-X-DISCONTINUITY-SEQUENCE: 0
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:06.531Z
    #EXTINF:2.000
    https://foo.com/bar/0.ts
    #EXT-X-PROGRAM-DATE-TIME:2018-09-05T20:59:08.531Z
    #EXTINF:2.000
    https://foo.com/bar/1.ts

    #EXT-X-PREFETCH:https://foo.com/bar/2.ts
    #EXT-X-PREFETCH:https://foo.com/bar/3.ts
  `);
  const {prefetchSegments} = parsed;

  t.is(prefetchSegments.length, 2);
  t.is(prefetchSegments[0].uri, "https://foo.com/bar/2.ts");
  t.is(prefetchSegments[1].uri, "https://foo.com/bar/3.ts");

  const stringified = HLS.stringify(parsed);

  t.true(stringified.includes('#EXT-X-PREFETCH:https://foo.com/bar/2.ts'));
  t.true(stringified.includes('#EXT-X-PREFETCH:https://foo.com/bar/3.ts'));
});
