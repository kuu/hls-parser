const {URL} = require('url');

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

function createUrl(url, base) {
  return tryCatch(
    () => {
      return new URL(url);
    },
    () => {
      return new URL(url, base);
    }
  );
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

module.exports = {
  THROW,
  ASSERT: process.env.NODE_ENV === 'production' ? _empty : ASSERT,
  PARAMCHECK: process.env.NODE_ENV === 'production' ? _empty : PARAMCHECK,
  CONDITIONALPARAMCHECK: process.env.NODE_ENV === 'production' ? _empty : CONDITIONALPARAMCHECK,
  toNumber,
  hexToByteSequence,
  createUrl,
  tryCatch,
  splitAt,
  trim,
  splitByCommaWithPreservingQuotes,
  camelify
};
