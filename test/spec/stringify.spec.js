const test = require('ava');
const fixtures = require('../helpers/fixtures');
const utils = require('../helpers/utils');
const HLS = require('../..');

HLS.setOptions({strictMode: true});

for (const {name, m3u8, object} of fixtures) {
  test(name, t => {
    const result = HLS.stringify(object);
    t.is(result, utils.stripCommentsAndEmptyLines(m3u8));
  });
}
