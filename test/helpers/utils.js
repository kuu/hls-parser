const HLS = require('../..');

HLS.setOptions({strictMode: true});

function parsePass(t, text) {
  let obj;
  try {
    obj = HLS.parse(text);
  } catch (err) {
    t.fail(err.stack);
  }
  t.truthy(obj);
  return obj;
}

function stringifyPass(t, obj) {
  let text;
  try {
    text = HLS.stringify(obj);
  } catch (err) {
    t.fail(err.stack);
  }
  t.truthy(text);
  return text;
}

function bothPass(t, text) {
  const obj = parsePass(t, text);
  return stringifyPass(t, obj);
}

function parseFail(t, text) {
  try {
    HLS.parse(text);
  } catch (err) {
    return t.truthy(err);
  }
  t.fail('HLS.parse() did not fail');
}

function stringifyFail(t, obj) {
  try {
    HLS.stringify(obj);
  } catch (err) {
    return t.truthy(err);
  }
  t.fail('HLS.stringify() did not fail');
}

function stripSpaces(text) {
  const chars = [];
  let insideDoubleQuotes = false;
  for (const ch of text) {
    if (ch === '"') {
      if (insideDoubleQuotes) {
        insideDoubleQuotes = false;
      } else {
        insideDoubleQuotes = true;
      }
    } else if (ch === ' ') {
      if (!insideDoubleQuotes) {
        continue;
      }
    }
    chars.push(ch);
  }
  return chars.join('');
}

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
        return lines.push(stripSpaces(line));
      }
      // comment
      return;
    }
    // uri
    lines.push(line);
  });
  return lines.join('\n');
}

module.exports = {
  parsePass,
  stringifyPass,
  bothPass,
  parseFail,
  stringifyFail,
  stripCommentsAndEmptyLines
};
