const test = require('ava');
const HLS = require('../../../../..');
const utils = require('../../../../helpers/utils');

// The URI line is REQUIRED
test('#EXT-X-STREAM-INF_01', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
  `);
});

// Every EXT-X-STREAM-INF tag MUST include the BANDWIDTH attribute.
test('#EXT-X-STREAM-INF_02', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1280000
    /video/main.m3u8
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000
    /video/main.m3u8
  `);
});

// RESOLUTION The value is a decimal-resolution:
//  two decimal-integers separated by the "x"
//  character.  The first integer is a horizontal pixel dimension
//  (width); the second is a vertical pixel dimension (height).
test('#EXT-X-STREAM-INF_03', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=123x456
    /video/main.m3u8
  `);
  t.deepEqual(playlist.variants[0].resolution, {width: 123, height: 456});
});

// AUDIO attribute MUST match the value of the
// GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in the Master
// Playlist whose TYPE attribute is AUDIO.
test('#EXT-X-STREAM-INF_04', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,AUDIO="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="test1",NAME="en",DEFAULT=YES,URI="/audio/en.m3u8"
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,AUDIO="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="test",NAME="en",DEFAULT=YES,URI="/audio/en.m3u8"
  `);
});

// VIDEO MUST match the value of the
// GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in the Master
// Playlist whose TYPE attribute is VIDEO.
test('#EXT-X-STREAM-INF_05', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,VIDEO="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="test1",NAME="en",DEFAULT=YES,URI="/audio/en.m3u8"
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,VIDEO="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="test",NAME="en",DEFAULT=YES,URI="/audio/en.m3u8"
  `);
});

// SUBTITLES MUST match the value of the
// GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in the Master
// Playlist whose TYPE attribute is SUBTITLES.
test('#EXT-X-STREAM-INF_06', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,SUBTITLES="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="test1",NAME="en",DEFAULT=YES,URI="/audio/en.m3u8"
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,SUBTITLES="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="test",NAME="en",DEFAULT=YES,URI="/audio/en.m3u8"
  `);
});

// CLOSED-CAPTIONS: it MUST match the value of the
// GROUP-ID attribute of an EXT-X-MEDIA tag elsewhere in the Playlist
// whose TYPE attribute is CLOSED-CAPTIONS
test('#EXT-X-STREAM-INF_07', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,CLOSED-CAPTIONS="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="test1",NAME="en",DEFAULT=YES,INSTREAM-ID="CC1"
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,CLOSED-CAPTIONS="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="test",NAME="en",DEFAULT=YES,INSTREAM-ID="CC1"  `);
});

// CLOSED-CAPTIONS: The value can be either a quoted-string or an enumerated-string with the value NONE.
test('#EXT-X-STREAM-INF_07-01', t => {
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,CLOSED-CAPTIONS=NONE
    /video/main.m3u8
  `);
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,CLOSED-CAPTIONS=NONE
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="test",NAME="en",DEFAULT=YES,INSTREAM-ID="CC1"
  `);
  t.is(playlist.variants[0].closedCaptions.length, 0);
});

// CLOSED-CAPTIONS: If the value is the enumerated-string value NONE,
// all EXT-X-STREAM-INF tags MUST have this attribute with a value of NONE,
// indicating that there are no closed captions in any Variant Stream in the Master Playlist.
test('#EXT-X-STREAM-INF_07-02', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,CLOSED-CAPTIONS=NONE
    /video/main.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=2040000,CLOSED-CAPTIONS="test"
    /video/high.m3u8
    #EXT-X-MEDIA:TYPE=CLOSED-CAPTIONS,GROUP-ID="test",NAME="en",DEFAULT=YES,INSTREAM-ID="CC1"
  `);
});

test('#EXT-X-STREAM-INF_07-03', t => {
  const sourceText = `
  #EXTM3U
  #EXT-X-STREAM-INF:BANDWIDTH=1280000,CLOSED-CAPTIONS=NONE
  /video/main.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=2040000,CLOSED-CAPTIONS=NONE
  /video/high.m3u8
  `;
  HLS.setOptions({allowClosedCaptionsNone: true});
  const obj = HLS.parse(sourceText);
  const text = HLS.stringify(obj);
  t.is(text, utils.stripCommentsAndEmptyLines(sourceText));
});

// The URI attribute of the EXT-X-MEDIA tag is REQUIRED if the media
// type is SUBTITLES
test('#EXT-X-STREAM-INF_08', t => {
  utils.parseFail(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,SUBTITLES="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="test",NAME="en",DEFAULT=YES
  `);
  utils.bothPass(t, `
    #EXTM3U
    #EXT-X-STREAM-INF:BANDWIDTH=1280000,SUBTITLES="test"
    /video/main.m3u8
    #EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="test",NAME="en",DEFAULT=YES,URI="/audio/en.m3u8"
  `);
});
