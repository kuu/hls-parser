function removeSpaceFromLine(line) {
  let inside = false;
  let str = '';
  for (const ch of line) {
    if (ch === '"') {
      inside = !inside;
    } else if (!inside && ch === ' ') {
      continue;
    }
    str += ch;
  }
  return str;
}

function strip(playlist) {
  playlist = playlist.trim();
  const filtered = [];
  for (let line of playlist.split('\n')) {
    line = removeSpaceFromLine(line);
    if (line.startsWith('#')) {
      if (line.startsWith('#EXT')) {
        filtered.push(line);
      }
    } else {
      filtered.push(line);
    }
  }
  return filtered.join('\n');
}

function equalPlaylist(t, expected, actual) {
  if (expected) {
    expected = strip(expected);
  }
  if (actual) {
    actual = strip(actual);
  }
  if (expected === actual) {
    return t.pass();
  }
  t.fail(`expected="${expected}", actual="${actual}"`);
}

function notEqualPlaylist(t, expected, actual) {
  if (expected) {
    expected = strip(expected);
  }
  if (actual) {
    actual = strip(actual);
  }
  if (expected === actual) {
    t.fail(`expected="${expected}", actual="${actual}"`);
    return t.fail();
  }
  t.pass();
}

module.exports = {
  equalPlaylist,
  notEqualPlaylist
};
