const {URL} = require('url');
const debug = require('debug');
const utils = require('./utils');
const {
  Rendition,
  Variant,
  SessionData,
  Key,
  MediaInitializationSection,
  DateRange,
  MasterPlaylist,
  MediaPlaylist,
  Segment
} = require('./types');

const print = debug('hls-parser');

function INVALIDPLAYLIST(msg) {
  utils.THROW(new Error(`Invalid Playlist : ${msg}`));
}

function unquote(str) {
  return utils.trim(str, '"');
}

function getTagCategory(tagName) {
  switch (tagName) {
    case 'EXTM3U':
    case 'EXT-X-VERSION':
      return 'Basic';
    case 'EXTINF':
    case 'EXT-X-BYTERANGE':
    case 'EXT-X-DISCONTINUITY':
    case 'EXT-X-KEY':
    case 'EXT-X-MAP':
    case 'EXT-X-PROGRAM-DATE-TIME':
    case 'EXT-X-DATERANGE':
      return 'Segment';
    case 'EXT-X-TARGETDURATION':
    case 'EXT-X-MEDIA-SEQUENCE':
    case 'EXT-X-DISCONTINUITY-SEQUENCE':
    case 'EXT-X-ENDLIST':
    case 'EXT-X-PLAYLIST-TYPE':
    case 'EXT-X-I-FRAMES-ONLY':
      return 'MediaPlaylist';
    case 'EXT-X-MEDIA':
    case 'EXT-X-STREAM-INF':
    case 'EXT-X-I-FRAME-STREAM-INF':
    case 'EXT-X-SESSION-DATA':
    case 'EXT-X-SESSION-KEY':
      return 'MasterPlaylist';
    case 'EXT-X-INDEPENDENT-SEGMENTS':
    case 'EXT-X-START':
      return 'MediaorMasterPlaylist';
    default:
      return 'Unknown';
  }
}

function parseEXTINF(param) {
  const pair = utils.splitAt(param, ',');
  return {duration: utils.toNumber(pair[0]), title: pair[1]};
}

function parseBYTERANGE(param) {
  const pair = utils.splitAt(param, '@');
  return {length: utils.toNumber(pair[0]), offset: utils.toNumber(pair[1])};
}

function parseResolution(str) {
  const pair = utils.splitAt(str, 'x');
  return {width: utils.toNumber(pair[0]), height: utils.toNumber(pair[1])};
}

function parseIV(str) {
  const iv = utils.hexToByteSequence(str);
  if (iv.length !== 16) {
    INVALIDPLAYLIST('IV must be a 128-bit unsigned integer');
  }
  return iv;
}

function parseAttributeList(param, baseUrl) {
  const list = utils.splitByCommaWithPreservingQuotes(param);
  const attributes = {};
  list.forEach(item => {
    const [key, value] = utils.splitAt(item, '=');
    const val = unquote(value);
    switch (key) {
      case 'URI':
        attributes[key] = utils.createUrl(val, baseUrl);
        break;
      case 'START-DATE':
      case 'END-DATE':
        attributes[key] = new Date(val);
        break;
      case 'IV':
        attributes[key] = parseIV(val);
        break;
      case 'BYTERANGE':
        attributes[key] = parseBYTERANGE(val);
        break;
      case 'RESOLUTION':
        attributes[key] = parseResolution(val);
        break;
      case 'END-ON-NEXT':
      case 'DEFAULT':
      case 'AUTOSELECT':
      case 'FORCED':
      case 'PRECISE':
        attributes[key] = val === 'YES';
        break;
      case 'DURATION':
      case 'PLANNED-DURATION':
      case 'BANDWIDTH':
      case 'AVERAGE-BANDWIDTH':
      case 'FRAME-RATE':
      case 'TIME-OFFSET':
        attributes[key] = utils.toNumber(val);
        break;
      default:
        if (key.startsWith('SCTE35-')) {
          attributes[key] = utils.hexToByteSequence(val);
        } else {
          attributes[key] = val;
        }
    }
  });
  return attributes;
}

function parseTagParam(name, param, baseUrl) {
  switch (name) {
    case 'EXTM3U':
    case 'EXT-X-DISCONTINUITY':
    case 'EXT-X-ENDLIST':
    case 'EXT-X-I-FRAMES-ONLY':
    case 'EXT-X-INDEPENDENT-SEGMENTS':
      return [null, null];
    case 'EXT-X-VERSION':
    case 'EXT-X-TARGETDURATION':
    case 'EXT-X-MEDIA-SEQUENCE':
    case 'EXT-X-DISCONTINUITY-SEQUENCE':
      return [utils.toNumber(param), null];
    case 'EXT-X-KEY':
    case 'EXT-X-MAP':
    case 'EXT-X-DATERANGE':
    case 'EXT-X-MEDIA':
    case 'EXT-X-STREAM-INF':
    case 'EXT-X-I-FRAME-STREAM-INF':
    case 'EXT-X-SESSION-DATA':
    case 'EXT-X-SESSION-KEY':
    case 'EXT-X-START':
      return [null, parseAttributeList(param, baseUrl)];
    case 'EXTINF':
      return [parseEXTINF(param), null];
    case 'EXT-X-BYTERANGE':
      return [parseBYTERANGE(param), null];
    case 'EXT-X-PROGRAM-DATE-TIME':
      return [new Date(param), null];
    case 'EXT-X-PLAYLIST-TYPE':
      return [param, null]; // <EVENT|VOD>
    default:
      return [param, null]; // Unknown tag
  }
}

function MIXEDTAGS() {
  utils.THROW(new Error('Mixed Tag: This file contains media and master playlist tags.'));
}

function splitTag(line) {
  const index = line.indexOf(':');
  if (index === -1) {
    return [line.slice(1), null];
  }
  return [line.slice(1, index), line.slice(index + 1)];
}

function parseRendition(line) {
  const attributes = line.attributes;
  const rendition = new Rendition({
    type: attributes['TYPE'],
    uri: attributes['URI'],
    groupId: attributes['GROUP-ID'],
    language: attributes['LANGUAGE'],
    assocLanguage: attributes['ASSOC-LANGUAGE'],
    name: attributes['NAME'],
    isDefault: attributes['DEFAULT'],
    autoselect: attributes['AUTOSELECT'],
    forced: attributes['FORCED'],
    instreamId: attributes['INSTREAM-ID'],
    characteristics: attributes['CHARACTERISTICS'],
    channels: attributes['CHANNELS']
  });
  return rendition;
}

function addRendition(variant, line, type) {
  const rendition = parseRendition(line);
  const renditions = variant[utils.camelify(type)];
  renditions.push(rendition);
  if (rendition.isDefault) {
    variant.currentRenditions[type] = renditions.length - 1;
  }
}

function parseVariant(lines, variantAttrs, uri, iFrameOnly = false) {
  const variant = new Variant({
    uri,
    bandwidth: variantAttrs['BANDWIDTH'],
    averageBandwidth: variantAttrs['AVERAGE-BANDWIDTH'],
    codecs: variantAttrs['CODECS'],
    resolution: variantAttrs['RESOLUTION'],
    frameRate: variantAttrs['FRAME-RATE'],
    hdcpLevel: variantAttrs['HDCP-LEVEL']
  });
  for (const line of lines) {
    if (line.name === 'EXT-X-MEDIA') {
      const renditionAttrs = line.attributes;
      if (variantAttrs['AUDIO'] === renditionAttrs['GROUP-ID'] &&
        renditionAttrs['TYPE'] === 'AUDIO') {
        addRendition(variant, line, 'AUDIO');
      } else if (variantAttrs['VIDEO'] === renditionAttrs['GROUP-ID'] &&
        renditionAttrs['TYPE'] === 'VIDEO') {
        addRendition(variant, line, 'VIDEO');
      } else if (variantAttrs['SUBTITLES'] === renditionAttrs['GROUP-ID'] &&
        renditionAttrs['TYPE'] === 'SUBTITLES') {
        addRendition(variant, line, 'SUBTITLES');
      } else if (variantAttrs['CLOSED-CAPTIONS'] === renditionAttrs['GROUP-ID'] &&
        renditionAttrs['TYPE'] === 'CLOSED-CAPTIONS') {
        addRendition(variant, line, 'CLOSED-CAPTIONS');
      }
    }
  }
  variant.isIFrameOnly = iFrameOnly;
  return variant;
}

function parseMasterPlaylist(lines, url) {
  const playlist = new MasterPlaylist({uri: utils.createUrl(url)});
  for (const [index, line] of lines.entries()) {
    const name = line.name;
    const value = line.value;
    const attributes = line.attributes;
    if (name === 'EXT-X-VERSION') {
      playlist.version = value;
    } else if (name === 'EXT-X-STREAM-INF') {
      const uri = lines[index + 1];
      if (uri instanceof URL === false) {
        INVALIDPLAYLIST('EXT-X-STREAM-INF is not followed by a URI line');
      }
      const variant = parseVariant(lines, attributes, uri);
      if (variant) {
        playlist.variants.push(variant);
      }
    } else if (name === 'EXT-X-I-FRAME-STREAM-INF') {
      const variant = parseVariant(lines, attributes, attributes.URI, true);
      if (variant) {
        playlist.variants.push(variant);
      }
    } else if (name === 'EXT-X-SESSION-DATA') {
      const sessionData = new SessionData({
        id: attributes['DATA-ID'],
        value: attributes['VALUE'],
        uri: attributes['URI'],
        language: attributes['LANGUAGE']
      });
      playlist.sessionDataList.push(sessionData);
    } else if (name === 'EXT-X-SESSION-KEY') {
      playlist.sessionKey = new Key({
        method: attributes['METHOD'],
        uri: attributes['URI'],
        iv: attributes['IV'],
        format: attributes['KEYFORMAT'],
        formatVersion: attributes['KEYFORMATVERSIONS']
      });
    } else if (name === 'EXT-X-INDEPENDENT-SEGMENTS') {
      playlist.independentSegments = true;
    } else if (name === 'EXT-X-START') {
      playlist.offset = attributes['TIME-OFFSET'];
    }
  }
  return playlist;
}

function parseSegment(lines, uri, start, end, mediaSequenceNumber, discontinuitySequence) {
  const segment = new Segment({uri, mediaSequenceNumber, discontinuitySequence});
  for (let i = start; i <= end; i++) {
    const name = lines[i].name;
    const value = lines[i].value;
    const attributes = lines[i].attributes;
    if (name === 'EXTINF') {
      segment.duration = value.duration;
      segment.title = value.title;
    } else if (name === 'EXT-X-BYTERANGE') {
      segment.byterange = value;
    } else if (name === 'EXT-X-DISCONTINUITY') {
      segment.discontinuity = true;
    } else if (name === 'EXT-X-KEY') {
      segment.key = new Key({
        method: attributes['METHOD'],
        uri: attributes['URI'],
        iv: attributes['IV'],
        format: attributes['KEYFORMAT'],
        formatVersion: attributes['KEYFORMATVERSIONS']
      });
    } else if (name === 'EXT-X-MAP') {
      segment.map = new MediaInitializationSection({
        uri: attributes['URI'],
        byterange: attributes['BYTERANGE']
      });
    } else if (name === 'EXT-X-PROGRAM-DATE-TIME') {
      segment.programDateTime = value;
    } else if (name === 'EXT-X-DATERANGE') {
      const attrs = {};
      Object.keys(attributes).forEach(key => {
        if (key.startsWith('SCTE35-') || key.startsWith('X-')) {
          attrs[key] = attributes[key];
        }
      });
      segment.dateRange = new DateRange({
        id: attributes['ID'],
        classId: attributes['CLASS'],
        start: attributes['START-DATE'],
        end: attributes['END-DATE'],
        duration: attributes['DURATION'],
        plannedDuration: attributes['PLANNED-DURATION'],
        endOnNext: attributes['END-ON-NEXT'],
        attributes: attrs
      });
    }
  }
  return segment;
}

function parseMediaPlaylist(lines, url) {
  const playlist = new MediaPlaylist({uri: utils.createUrl(url)});
  let segmentStart = -1;
  let mediaSequence = 0;
  let discontinuitySequence = 0;
  let key = null;
  for (const [index, line] of lines.entries()) {
    const name = line.name;
    const value = line.value;
    const attributes = line.attributes;
    if (line.category === 'Segment') {
      if (segmentStart === -1) {
        segmentStart = index;
      }
      continue;
    }
    if (name === 'EXT-X-VERSION') {
      playlist.version = value;
    } else if (name === 'EXT-X-TARGETDURATION') {
      playlist.targetDuration = value;
    } else if (name === 'EXT-X-MEDIA-SEQUENCE') {
      playlist.mediaSequenceBase = mediaSequence = value;
    } else if (name === 'EXT-X-DISCONTINUITY-SEQUENCE') {
      playlist.discontinuitySequenceBase = discontinuitySequence = value;
    } else if (name === 'EXT-X-ENDLIST') {
      playlist.endlist = true;
    } else if (name === 'EXT-X-PLAYLIST-TYPE') {
      playlist.playlistType = value;
    } else if (name === 'EXT-X-I-FRAMES-ONLY') {
      playlist.isIFrame = true;
    } else if (name === 'EXT-X-INDEPENDENT-SEGMENTS') {
      playlist.independentSegments = true;
    } else if (name === 'EXT-X-START') {
      playlist.offset = attributes['TIME-OFFSET'];
    } else if (line instanceof URL) {
      if (segmentStart === -1) {
        INVALIDPLAYLIST('A URI line is not preceded by any segment tags');
      }
      const segment = parseSegment(lines, line, segmentStart, index - 1, mediaSequence++, discontinuitySequence++);
      if (segment) {
        if (segment.discontinuity) {
          segment.discontinuitySequence = playlist.discontinuitySequenceBase;
        }
        if (segment.key) {
          key = segment.key;
        } else if (key) {
          segment.key = key;
        }
        playlist.segments.push(segment);
      }
      segmentStart = -1;
    }
  }
  return playlist;
}

class FileParser {
  constructor(url) {
    utils.PARAMCHECK(url);
    this.baseUrl = url;
    this.version = undefined;
    this.isMasterPlaylist = undefined;
  }

  CHECKTAGCATEGORY(category) {
    if (category === 'Segment' || category === 'MediaPlaylist') {
      if (this.isMasterPlaylist === undefined) {
        this.isMasterPlaylist = false;
        return;
      }
      if (this.isMasterPlaylist) {
        MIXEDTAGS();
      }
      return;
    }
    if (category === 'MasterPlaylist') {
      if (this.isMasterPlaylist === undefined) {
        this.isMasterPlaylist = true;
        return;
      }
      if (this.isMasterPlaylist === false) {
        MIXEDTAGS();
      }
    }
    // category === 'Basic' or 'MediaorMasterPlaylist' or 'Unknown'
  }

  parseTag(line) {
    const [name, param] = splitTag(line);
    const category = getTagCategory(name);
    this.CHECKTAGCATEGORY(category);
    if (category === 'Unknown') {
      return null;
    }
    const [value, attributes] = parseTagParam(name, param, this.baseUrl);
    return {name, category, value, attributes};
  }

  lexicalParse(text) {
    const lines = [];
    text.split('\n').forEach(l => {
      const line = l.trim();
      if (!line) {
        // empty line
        return;
      }
      if (line.startsWith('#')) {
        if (line.startsWith('#EXT')) {
          // tag
          const tag = this.parseTag(line);
          if (tag) {
            lines.push(tag);
          }
          return;
        }
        // comment
        return;
      }
      // uri
      lines.push(utils.createUrl(line, this.baseUrl));
    });
    if (lines.length === 0 || lines[0].name !== 'EXTM3U') {
      utils.THROW(new Error('Invalid Playlist: The EXTM3U tag MUST be the first line.'));
    }
    return lines;
  }

  semanticParse(...params) {
    if (this.isMasterPlaylist) {
      return parseMasterPlaylist(...params);
    }
    return parseMediaPlaylist(...params);
  }

}

function parse(text, url) {
  print(`HLS.parse: ${url}`);
  const fileParser = new FileParser(url);
  const lines = fileParser.lexicalParse(text);
  return fileParser.semanticParse(lines, url);
  /*
  return {
    compatibleVersion: 1
  };
  */
}

module.exports = parse;
