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

// it MUST match the value of the
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
