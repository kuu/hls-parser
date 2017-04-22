function THROW(err) {
  throw err;
}

function ASSERT(msg, ...params) {
  for (const [index, param] of params.entries()) {
    if (!param) {
      THROW(new Error(`${msg} : Failed at [${index}]`));
    }
  }
}

function CONDITIONALASSERT(...params) {
  for (const [index, [cond, param]] of params.entries()) {
    if (!cond) {
      continue;
    }
    if (!param) {
      THROW(new Error(`Conditional Assert : Failed at [${index}]`));
    }
  }
}

function PARAMCHECK(...params) {
  for (const [index, param] of params.entries()) {
    if (param === undefined) {
      THROW(new Error(`Param Check : Failed at [${index}]`));
    }
  }
}

function CONDITIONALPARAMCHECK(...params) {
  for (const [index, [cond, param]] of params.entries()) {
    if (!cond) {
      continue;
    }
    if (param === undefined) {
      THROW(new Error(`Conditional Param Check : Failed at [${index}]`));
    }
  }
}

function INVALIDPLAYLIST(msg) {
  THROW(new Error(`Invalid Playlist : ${msg}`));
}

function _empty() {}

function toNumber(str, radix = 10) {
  if (typeof str === 'number') {
    return str;
  }
  let num;
  if (radix === 10) {
    num = parseFloat(str, radix);
  } else {
    num = parseInt(str, radix);
  }
  if (isNaN(num)) {
    return 0;
  }
  return num;
}

function hexToByteSequence(str) {
  if (str.startsWith('0x') || str.startsWith('0X')) {
    str = str.slice(2);
  }
  const numArray = [];
  for (let i = 0; i < str.length; i += 2) {
    numArray.push(toNumber(str.substr(i, 2), 16));
  }
  return Buffer.from(numArray);
}

function byteSequenceToHex(sequence, start = 0, end = sequence.length) {
  if (end <= start) {
    THROW(new Error(`end must be larger than start : start=${start}, end=${end}`));
  }
  const array = [];
  for (let i = start; i < end; i++) {
    array.push(`0${(sequence[i] & 0xFF).toString(16).toUpperCase()}`.slice(-2));
  }
  return `0x${array.join('')}`;
}

function tryCatch(body, errorHandler) {
  try {
    return body();
  } catch (err) {
    return errorHandler(err);
  }
}

function splitAt(str, delimiter, index = 0) {
  let lastDelimiterPos = -1;
  for (let i = 0, j = 0; i < str.length; i++) {
    if (str[i] === delimiter) {
      if (j++ === index) {
        return [str.slice(0, i), str.slice(i + 1)];
      }
      lastDelimiterPos = i;
    }
  }
  if (lastDelimiterPos !== -1) {
    return [str.slice(0, lastDelimiterPos), str.slice(lastDelimiterPos + 1)];
  }
  return [str];
}

function trim(str, char = ' ') {
  if (!str) {
    return str;
  }
  str = str.trim();
  if (char === ' ') {
    return str;
  }
  if (str.startsWith(char)) {
    str = str.slice(1);
  }
  if (str.endsWith(char)) {
    str = str.slice(0, -1);
  }
  return str;
}

function splitByCommaWithPreservingQuotes(str) {
  const list = [];
  let doParse = true;
  let start = 0;
  const prevQuotes = [];
  for (let i = 0; i < str.length; i++) {
    const curr = str[i];
    if (doParse && curr === ',') {
      list.push(str.slice(start, i).trim());
      start = i + 1;
      continue;
    }
    if (curr === '"' || curr === '\'') {
      if (doParse) {
        prevQuotes.push(curr);
        doParse = false;
      } else if (curr === prevQuotes[prevQuotes.length - 1]) {
        prevQuotes.pop();
        doParse = true;
      } else {
        prevQuotes.push(curr);
      }
    }
  }
  list.push(str.slice(start).trim());
  return list;
}

function camelify(str) {
  const array = [];
  let nextUpper = false;
  for (const ch of str) {
    if (ch === '-' || ch === '_') {
      nextUpper = true;
      continue;
    }
    if (nextUpper) {
      array.push(ch.toUpperCase());
      nextUpper = false;
      continue;
    }
    array.push(ch.toLowerCase());
  }
  return array.join('');
}

function formatDate(date) {
  const YYYY = date.getUTCFullYear();
  const MM = ('0' + (date.getUTCMonth() + 1)).slice(-2);
  const DD = ('0' + date.getUTCDate()).slice(-2);
  const hh = ('0' + date.getUTCHours()).slice(-2);
  const mm = ('0' + date.getUTCMinutes()).slice(-2);
  const ss = ('0' + date.getUTCSeconds()).slice(-2);
  const msc = ('00' + date.getUTCMilliseconds()).slice(-3);
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${msc}Z`;
}

function hasOwnProp(obj, propName) {
  return Object.hasOwnProperty.call(obj, propName);
}

module.exports = {
  THROW,
  ASSERT: process.env.NODE_ENV === 'production' ? _empty : ASSERT,
  CONDITIONALASSERT: process.env.NODE_ENV === 'production' ? _empty : CONDITIONALASSERT,
  PARAMCHECK: process.env.NODE_ENV === 'production' ? _empty : PARAMCHECK,
  CONDITIONALPARAMCHECK: process.env.NODE_ENV === 'production' ? _empty : CONDITIONALPARAMCHECK,
  INVALIDPLAYLIST,
  toNumber,
  hexToByteSequence,
  byteSequenceToHex,
  tryCatch,
  splitAt,
  trim,
  splitByCommaWithPreservingQuotes,
  camelify,
  formatDate,
  hasOwnProp
};
