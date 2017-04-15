const path = require('path');
const fs = require('fs');

const fixtures = [];
const baseDir = path.join(__dirname, '../fixtures/m3u8');
const filenames = fs.readdirSync(baseDir);

filenames.forEach(filename => {
  if (filename.endsWith('.m3u8')) {
    const name = path.basename(filename, '.m3u8');
    const filepath = path.join(baseDir, filename);
    const data = fs.readFileSync(filepath, 'utf8');
    const expected = require(`../fixtures/expected/${name}.js`);
    fixtures.push({name, data, expected});
  }
});

module.exports = fixtures;
