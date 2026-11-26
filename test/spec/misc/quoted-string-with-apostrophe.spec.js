const test = require('ava');
const HLS = require('../../..');

test('Quoted string with an apostrophe', t => {
  const playlist = HLS.parse(`
    #EXTM3U
    #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="Director's cut",LANGUAGE="en",DEFAULT=YES,AUTOSELECT=YES,URI="commentary.m3u8"
    #EXT-X-STREAM-INF:BANDWIDTH=1000000,AUDIO="aud"
    main.m3u8
  `);
  const rendition = playlist.variants[0].audio[0];
  t.is(rendition.name, 'Director\'s cut');
  t.is(rendition.language, 'en');
  t.is(rendition.isDefault, true);
  t.is(rendition.autoselect, true);
  t.is(rendition.uri, 'commentary.m3u8');
});
