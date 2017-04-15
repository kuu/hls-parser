const test = require('ava');
const utils = require('../../utils');

test('utils.THROW', t => {
  try {
    utils.THROW(new Error('abc'));
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'abc');
  }
});

test('utils.ASSERT', t => {
  utils.ASSERT('No error occurs', 1, 2, 3);
  try {
    utils.ASSERT('Error occurs', 1, 2, false);
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'Error occurs : Failed at [2]');
  }
});

test('utils.PARAMCHECK', t => {
  utils.PARAMCHECK(1, 2, 3);
  try {
    utils.PARAMCHECK(1, 2, undefined);
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'Param Check : Failed at [2]');
  }
});

test('utils.CONDITIONALPARAMCHECK', t => {
  utils.CONDITIONALPARAMCHECK([true, 1], [true, 2], [true, 3]);
  utils.CONDITIONALPARAMCHECK([false, undefined], [false, 1], [false, 2]);
  try {
    utils.CONDITIONALPARAMCHECK([false, undefined], [true, 1], [true, undefined]);
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'Conditional Param Check : Failed at [2]');
  }
});

test('utils.toNumber', t => {
  t.is(utils.toNumber('123'), 123);
  t.is(utils.toNumber(123), 123);
  t.is(utils.toNumber('abc'), 0);
  t.is(utils.toNumber('8bc'), 8);
});

test('utils.hexToByteSequence', t => {
  t.deepEqual(utils.hexToByteSequence('0x000000'), Buffer.from([0, 0, 0]));
  t.deepEqual(utils.hexToByteSequence('0xFFFFFF'), Buffer.from([255, 255, 255]));
  t.deepEqual(utils.hexToByteSequence('FFFFFF'), Buffer.from([255, 255, 255]));
});

test('utils.createUrl', t => {
  let url = utils.createUrl('http://abc.com');
  t.is(url.href, 'http://abc.com/');
  url = utils.createUrl('http://abc.com', 'http://def.com');
  t.is(url.href, 'http://abc.com/');
  url = utils.createUrl('/abc', 'http://def.com');
  t.is(url.href, 'http://def.com/abc');
});

test('utils.tryCatch', t => {
  let result = utils.tryCatch(
    () => {
      return 1;
    },
    () => {
      return 0;
    }
  );
  t.is(result, 1);
  result = utils.tryCatch(
    () => {
      return JSON.parse('{{');
    },
    () => {
      return 0;
    }
  );
  t.is(result, 0);
  t.throws(() => {
    utils.tryCatch(
      () => {
        return JSON.parse('{{');
      },
      () => {
        return JSON.parse('}}');
      }
    );
  });
});

test('utils.splitAt', t => {
  t.deepEqual(utils.splitAt('a=1', '='), ['a', '1']);
  t.deepEqual(utils.splitAt('a=1=2', '='), ['a', '1=2']);
  t.deepEqual(utils.splitAt('a=1=2=3', '='), ['a', '1=2=3']);
  t.deepEqual(utils.splitAt('a=1=2=3', '=', 0), ['a', '1=2=3']);
  t.deepEqual(utils.splitAt('a=1=2=3', '=', 1), ['a=1', '2=3']);
  t.deepEqual(utils.splitAt('a=1=2=3', '=', 2), ['a=1=2', '3']);
  t.deepEqual(utils.splitAt('a=1=2=3', '=', -1), ['a=1=2', '3']);
});

test('utils.trim', t => {
  t.is(utils.trim(' abc '), 'abc');
  t.is(utils.trim(' abc ', ' '), 'abc');
  t.is(utils.trim('"abc"', '"'), 'abc');
  t.is(utils.trim('abc:', ':'), 'abc');
  t.is(utils.trim('abc'), 'abc');
  t.is(utils.trim(' "abc" ', '"'), 'abc');
});

test('utils.splitWithPreservingQuotes', t => {
  t.deepEqual(utils.splitByCommaWithPreservingQuotes('abc=123, def="4,5,6", ghi=78=9, jkl="abc\'123\'def"'), ['abc=123', 'def="4,5,6"', 'ghi=78=9', 'jkl="abc\'123\'def"']);
});

test('utls.camelify', t => {
  const props = ['caption', 'Caption', 'captioN', 'CAPTION', 'closed-captions', 'closed_captions', 'CLOSED-CAPTIONS'];
  const results = ['caption', 'caption', 'caption', 'caption', 'closedCaptions', 'closedCaptions', 'closedCaptions'];
  t.deepEqual(props.map(p => utils.camelify(p)), results);
});
