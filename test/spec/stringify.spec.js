const test = require('ava');
const fixtures = require('../helpers/fixtures');
const HLS = require('../../');

fixtures.forEach(({name, m3u8, object}) => {
  test(name, t => {
    const result = HLS.stringify(object);
    t.is(result, stripCommentsAndEmptyLines(m3u8));
  });
});

function stripCommentsAndEmptyLines(text) {
  const lines = [];
  text.split('\n').forEach(l => {
    const line = l.trim();
    if (!line) {
      // empty line
      return;
    }
    if (line.startsWith('#')) {
      if (line.startsWith('#EXT')) {
        // tag
        return lines.push(line);
      }
      // comment
      return;
    }
    // uri
    lines.push(line);
  });
  return lines.join('\n');
}
