const test = require("ava");
const utils = require("../../../../helpers/utils");

// https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis#section-4.4.4.7

test('#EXT-X-TAG_01', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:8
    #EXT-X-GAP
    1.ts
  `);
  utils.parsePass(t, `
    #EXTM3U
    #EXT-X-VERSION:8
    #EXT-X-TARGETDURATION:5
    #EXT-X-GAP
    #EXTINF:4,
    1.ts
  `);
});

test('#EXT-X-TAG_02', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-VERSION:8
    #EXT-X-TARGETDURATION:5
    #EXT-X-GAP
    #EXT-X-PART:DURATION=2,URI="1.ts"
    #EXT-X-ENDLIST
  `);
  utils.parsePass(t, `
    #EXTM3U
    #EXT-X-VERSION:8
    #EXT-X-TARGETDURATION:5
    #EXT-X-GAP
    #EXT-X-PART:DURATION=2,URI="1.ts",GAP=YES
    #EXT-X-ENDLIST
  `);
});
