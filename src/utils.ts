export interface HlsParserOptions {
    strictMode?: boolean;
    silent?: boolean;
    allowClosedCaptionsNone?: boolean;
}

let options: HlsParserOptions = {};

export function THROW(err: Error) {
    if (!options.strictMode) {
        if (!options.silent) {
            console.error(err.message);
        }
        return;
    }
    throw err;
}

export function ASSERT(msg, ...options: boolean[]): void {
    for (const [index, param] of options.entries()) {
        if (!param) {
            THROW(new Error(`${msg} : Failed at [${index}]`));
        }
    }
}

export function CONDITIONALASSERT(...options: [unknown, any][]): void {
    for (const [index, [cond, param]] of options.entries()) {
        if (!cond) {
            continue;
        }
        if (!param) {
            THROW(new Error(`Conditional Assert : Failed at [${index}]`));
        }
    }
}

export function PARAMCHECK(...options: unknown[]): void {
    for (const [index, param] of options.entries()) {
        if (param === undefined) {
            THROW(new Error(`Param Check : Failed at [${index}]`));
        }
    }
}

export function CONDITIONALPARAMCHECK(...options: [boolean, any][]): void {
    for (const [index, [cond, param]] of options.entries()) {
        if (!cond) {
            continue;
        }
        if (param === undefined) {
            THROW(new Error(`Conditional Param Check : Failed at [${index}]`));
        }
    }
}

export function INVALIDPLAYLIST(msg: string): void {
    THROW(new Error(`Invalid Playlist : ${msg}`));
}

export function toNumber(str: string, radix = 10): number {
    if (typeof str === 'number') {
        return str;
    }
    const num = radix === 10 ? Number.parseFloat(str) : Number.parseInt(str, radix);
    if (Number.isNaN(num)) {
        return 0;
    }
    return num;
}

export function hexToByteSequence(str: string): Buffer {
    if (str.startsWith('0x') || str.startsWith('0X')) {
        str = str.slice(2);
    }
    const numArray: number[] = [];
    for (let i = 0; i < str.length; i += 2) {
        numArray.push(toNumber(str.slice(i, i + 2), 16));
    }
    return Buffer.from(numArray);
}

export function byteSequenceToHex(sequence: Buffer, start = 0, end = sequence.length): string {
    if (end <= start) {
        THROW(new Error(`end must be larger than start : start=${start}, end=${end}`));
    }
    const array = [];
    for (let i = start; i < end; i++) {
        array.push(`0${(sequence[i] & 0xff).toString(16).toUpperCase()}`.slice(-2));
    }
    return `0x${array.join('')}`;
}

export type BodyHandler = () => string;
export type ErrorHandler = (Error) => void;

export function tryCatch(body: () => string, errorHandler: ErrorHandler): ReturnType<BodyHandler | ErrorHandler> {
    try {
        return body();
    } catch (err) {
        return errorHandler(err);
    }
}

export function splitAt(str: string, delimiter: string, index = 0): string[] | [string] {
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

export function trim(str: string, char = ' '): string {
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

export function splitByCommaWithPreservingQuotes(str: string): string[] {
    const list: string[] = [];
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
        if (curr === '"' || curr === "'") {
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

export function camelify(str): string {
    const array: string[] = [];
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

export function formatDate(date: Date): string {
    const YYYY = date.getUTCFullYear();
    const MM = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const DD = ('0' + date.getUTCDate()).slice(-2);
    const hh = ('0' + date.getUTCHours()).slice(-2);
    const mm = ('0' + date.getUTCMinutes()).slice(-2);
    const ss = ('0' + date.getUTCSeconds()).slice(-2);
    const msc = ('00' + date.getUTCMilliseconds()).slice(-3);
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${msc}Z`;
}

type Callable = (...any: any[]) => any;
export function hasOwnProp<T extends Record<string, Callable>, K extends keyof T>(
    obj: T,
    propName: K,
): ReturnType<T[K]> {
    return Object.hasOwnProperty.call(obj, propName);
}

export function setOptions(newOptions = {}): void {
    options = Object.assign(options, newOptions);
}

export function getOptions(): HlsParserOptions {
    return Object.assign({}, options);
}
