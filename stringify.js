const debug = require('debug');

const print = debug('hls-parser');

function stringify(playlist) {
  print(`HLS.stringify: ${playlist.url}`);
}

module.exports = stringify;
