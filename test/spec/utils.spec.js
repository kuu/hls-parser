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

test('utils.byteSequenceToHex', t => {
  t.is(utils.byteSequenceToHex(Buffer.from([0, 0, 0])), '0x000000');
  t.is(utils.byteSequenceToHex(Buffer.from([255, 255, 255])), '0xFFFFFF');
  t.is(utils.byteSequenceToHex(Buffer.from([255, 255, 256])), '0xFFFF00');
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

test('utils.formatDate', t => {
  const DATE = '2014-03-05T11:15:00.000Z';
  t.is(utils.formatDate(new Date(DATE)), DATE);
  const LOCALDATE = '2000-01-01T08:59:59.999+09:00';
  const UTC = '1999-12-31T23:59:59.999Z';
  t.is(utils.formatDate(new Date(LOCALDATE)), UTC);
});

test('utils.relativePath', t => {
  let FROM;
  let TO;
  FROM = '/a/b/c/';
  TO = '/a/b/c/x';
  t.is(utils.relativePath(FROM, TO), 'x');
  TO = '/a/b/c/y';
  t.is(utils.relativePath(FROM, TO), 'y');
  TO = '/a/b/c/d/y';
  t.is(utils.relativePath(FROM, TO), 'd/y');
  TO = '/a/b/c/d/e/y';
  t.is(utils.relativePath(FROM, TO), 'd/e/y');
  TO = '/a/b/y';
  t.is(utils.relativePath(FROM, TO), '../y');
  TO = '/a/y';
  t.is(utils.relativePath(FROM, TO), '../../y');
  TO = '/y';
  t.is(utils.relativePath(FROM, TO), '../../../y');
  TO = '/f/g/h/y';
  t.is(utils.relativePath(FROM, TO), '../../../f/g/h/y');
  FROM = '/a/a/a/';
  TO = '/a/a';
  t.is(utils.relativePath(FROM, TO), '..');
  TO = '/a/a/a/a/a';
  t.is(utils.relativePath(FROM, TO), 'a/a');
  FROM = '/';
  TO = '/y';
  t.is(utils.relativePath(FROM, TO), 'y');
  TO = '/a/y';
  t.is(utils.relativePath(FROM, TO), 'a/y');
  FROM = '/a/b/c';
  TO = '/a/b/c/';
  t.is(utils.relativePath(FROM, TO), '');
  TO = '/a/b/c/d/';
  t.is(utils.relativePath(FROM, TO), 'd');
  TO = '/a/b/c/d/e/';
  t.is(utils.relativePath(FROM, TO), 'd/e');
  TO = '/a/b/';
  t.is(utils.relativePath(FROM, TO), '..');
  TO = '/a/';
  t.is(utils.relativePath(FROM, TO), '../..');
});
