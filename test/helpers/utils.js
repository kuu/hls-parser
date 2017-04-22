const HLS = require('../../');

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

module.exports = {
  parsePass,
  stringifyPass,
  bothPass,
  parseFail,
  stringifyFail
};
