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

class Dir {
  constructor(parent) {
    this.__parent__ = parent;
    this.__files__ = new Set();
    this.__children__ = {};
  }
  put(fileName) {
    if (hasOwnProp(this.__children__, fileName)) {
      this.__children__[fileName].put('');
    } else {
      this.__files__.add(fileName);
    }
  }
  hasDir(name) {
    if (hasOwnProp(this.__children__, name)) {
      return this.__children__[name].hasFile('');
    }
    return false;
  }
  hasFile(name) {
    return this.__files__.has(name);
  }
  mkdir(dirName) {
    if (!hasOwnProp(this.__children__, dirName)) {
      const dir = new Dir(this);
      this.__children__[dirName] = dir;
      return dir;
    }
    return this.__children__[dirName];
  }
  getParent() {
    return this.__parent__;
  }
  getChildren() {
    return this.__children__;
  }
}

function buildTree(...lists) {
  const root = new Dir(null);
  let last;
  for (const list of lists) {
    let current = root;
    for (const [index, key] of list.entries()) {
      if (index === list.length - 1) {
        current.put(key);
        break;
      }
      current = current.mkdir(key);
    }
    last = current;
  }
  return last;
}

function buildRelativePath(curr, prev, path, fileName) {
  // console.log(`buildRelativePath(curr=${curr}, prev=${prev}, path=${path}, search=${fileName})`);
  if (!curr) {
    return null;
  }
  if (curr.hasDir(fileName)) {
    return path;
  }
  if (curr.hasFile(fileName)) {
    return `${path}${fileName}`;
  }
  for (const [key, dir] of Object.entries(curr.getChildren())) {
    if (dir === prev) {
      continue;
    }
    path = buildRelativePath(dir, curr, `${path}${key}/`, fileName);
    if (path) {
      return path;
    }
  }
  return buildRelativePath(curr.getParent(), curr, `${path}../`, fileName);
}

function relativePath(from, to) {
  PARAMCHECK(from, to);
  if (!from.endsWith('/')) {
    from += '/';
  }
  if (to.endsWith('/')) {
    to += '__emptyFile__';
  }
  ASSERT('Paths must start with "/"', from.startsWith('/'), to.startsWith('/'));
  console.log(`relativePath: ${from}, ${to}`);
  const fromArray = from.split('/').splice(1);
  const toArray = to.split('/').splice(1);
  const toFileName = toArray.slice(-1)[0];
  const start = buildTree(toArray, fromArray);
  let relativePath = buildRelativePath(start, null, '', toFileName);
  if (relativePath.endsWith('__emptyFile__')) {
    relativePath = relativePath.slice(0, '__emptyFile__'.length * -1);
  }
  if (relativePath.endsWith('/')) {
    relativePath = relativePath.slice(0, -1);
  }
  return relativePath;
}

function isNode() {
  return typeof global === 'object' && this === global;
}

function hasOwnProp(obj, propName) {
  return Object.hasOwnProperty.call(obj, propName);
}

module.exports = {
  THROW,
  ASSERT: process.env.NODE_ENV === 'production' ? _empty : ASSERT,
  PARAMCHECK: process.env.NODE_ENV === 'production' ? _empty : PARAMCHECK,
  CONDITIONALPARAMCHECK: process.env.NODE_ENV === 'production' ? _empty : CONDITIONALPARAMCHECK,
  INVALIDPLAYLIST,
  toNumber,
  hexToByteSequence,
  byteSequenceToHex,
  createUrl,
  tryCatch,
  splitAt,
  trim,
  splitByCommaWithPreservingQuotes,
  camelify,
  formatDate,
  relativePath: isNode() ? require('path').relative : relativePath,
  hasOwnProp
};
