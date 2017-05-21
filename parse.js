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
  return {duration: utils.toNumber(pair[0]), title: decodeURIComponent(escape(pair[1]))};
}

function parseBYTERANGE(param) {
  const pair = utils.splitAt(param, '@');
  return {length: utils.toNumber(pair[0]), offset: pair[1] ? utils.toNumber(pair[1]) : -1};
}

function parseResolution(str) {
  const pair = utils.splitAt(str, 'x');
  return {width: utils.toNumber(pair[0]), height: utils.toNumber(pair[1])};
}

function parseIV(str) {
  const iv = utils.hexToByteSequence(str);
  if (iv.length !== 16) {
    utils.INVALIDPLAYLIST('IV must be a 128-bit unsigned integer');
  }
  return iv;
}

function parseUserAttribute(str) {
  if (str.startsWith('"')) {
    return unquote(str);
  } else if (str.startsWith('0x') || str.startsWith('0X')) {
    return utils.hexToByteSequence(str);
  }
  return utils.toNumber(str);
}

function setCompatibleVersionOfKey(params, attributes) {
  if (attributes['IV'] && params.compatibleVersion < 2) {
    params.compatibleVersion = 2;
  }
  if ((attributes['KEYFORMAT'] || attributes['KEYFORMATVERSIONS']) && params.compatibleVersion < 5) {
    params.compatibleVersion = 5;
  }
}

function parseAttributeList(param) {
  const list = utils.splitByCommaWithPreservingQuotes(param);
  const attributes = {};
  list.forEach(item => {
    const [key, value] = utils.splitAt(item, '=');
    const val = unquote(value);
    switch (key) {
      case 'URI':
        attributes[key] = val;
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
        } else if (key.startsWith('X-')) {
          attributes[key] = parseUserAttribute(value);
        } else {
          attributes[key] = val;
        }
    }
  });
  return attributes;
}

function parseTagParam(name, param) {
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
      return [null, parseAttributeList(param)];
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
  utils.INVALIDPLAYLIST(`The file contains both media and master playlist tags.`);
}

function splitTag(line) {
  const index = line.indexOf(':');
  if (index === -1) {
    return [line.slice(1).trim(), null];
  }
  return [line.slice(1, index).trim(), line.slice(index + 1).trim()];
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

function checkRedundantRendition(renditions, rendition) {
  let defaultFound = false;
  for (const item of renditions) {
    if (item.name === rendition.name) {
      return 'All EXT-X-MEDIA tags in the same Group MUST have different NAME attributes.';
    }
    if (item.isDefault) {
      defaultFound = true;
    }
  }
  if (defaultFound && rendition.isDefault) {
    return 'EXT-X-MEDIA A Group MUST NOT have more than one member with a DEFAULT attribute of YES.';
  }
  return '';
}

function addRendition(variant, line, type) {
  const rendition = parseRendition(line);
  const renditions = variant[utils.camelify(type)];
  const errorMessage = checkRedundantRendition(renditions, rendition);
  if (errorMessage) {
    utils.INVALIDPLAYLIST(errorMessage);
  }
  renditions.push(rendition);
  if (rendition.isDefault) {
    variant.currentRenditions[type] = renditions.length - 1;
  }
}

function matchTypes(attrs, variant) {
  ['AUDIO', 'VIDEO', 'SUBTITLES', 'CLOSED-CAPTIONS'].forEach(type => {
    if (attrs[type] && !variant[utils.camelify(type)].find(item => item.groupId === attrs[type])) {
      utils.INVALIDPLAYLIST(`${type} attribute MUST match the value of the GROUP-ID attribute of an EXT-X-MEDIA tag whose TYPE attribute is ${type}.`);
    }
  });
}

function parseVariant(lines, variantAttrs, uri, iFrameOnly = false, params) {
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
      const renditionType = renditionAttrs['TYPE'];
      if (!renditionType || !renditionAttrs['GROUP-ID']) {
        utils.INVALIDPLAYLIST('EXT-X-MEDIA TYPE attribute is REQUIRED.');
      }
      if (variantAttrs[renditionType] === renditionAttrs['GROUP-ID']) {
        addRendition(variant, line, renditionType);
        if (renditionType === 'CLOSED-CAPTIONS') {
          for (const rendition of variant.closedCaptions) {
            const instreamId = rendition.instreamId;
            if (instreamId && instreamId.startsWith('SERVICE') && params.compatibleVersion < 7) {
              params.compatibleVersion = 7;
              break;
            }
          }
        }
      }
    }
  }
  matchTypes(variantAttrs, variant);
  variant.isIFrameOnly = iFrameOnly;
  return variant;
}

function sameKey(key1, key2) {
  if (key1.method !== key2.method) {
    return false;
  }
  if (key1.uri !== key2.uri) {
    return false;
  }
  if (key1.iv) {
    if (!key2.iv) {
      return false;
    }
    if (key1.iv.length !== key2.iv.length) {
      return false;
    }
    for (let i = 0; i < key1.iv.length; i++) {
      if (key1.iv[i] !== key2.iv[i]) {
        return false;
      }
    }
  } else if (key2.iv) {
    return false;
  }
  if (key1.format !== key2.format) {
    return false;
  }
  if (key1.formatVersion !== key2.formatVersion) {
    return false;
  }
  return true;
}

function parseMasterPlaylist(lines, params) {
  const playlist = new MasterPlaylist();
  for (const [index, line] of lines.entries()) {
    const name = line.name;
    const value = line.value;
    const attributes = line.attributes;
    if (name === 'EXT-X-VERSION') {
      playlist.version = value;
    } else if (name === 'EXT-X-STREAM-INF') {
      const uri = lines[index + 1];
      if (typeof uri !== 'string' || uri.startsWith('#EXT')) {
        utils.INVALIDPLAYLIST('EXT-X-STREAM-INF must be followed by a URI line');
      }
      const variant = parseVariant(lines, attributes, uri, false, params);
      if (variant) {
        playlist.variants.push(variant);
      }
    } else if (name === 'EXT-X-I-FRAME-STREAM-INF') {
      const variant = parseVariant(lines, attributes, attributes.URI, true, params);
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
      if (playlist.sessionDataList.find(item => item.id === sessionData.id && item.language === sessionData.language)) {
        utils.INVALIDPLAYLIST('A Playlist MUST NOT contain more than one EXT-X-SESSION-DATA tag with the same DATA-ID attribute and the same LANGUAGE attribute.');
      }
      playlist.sessionDataList.push(sessionData);
    } else if (name === 'EXT-X-SESSION-KEY') {
      if (attributes['METHOD'] === 'NONE') {
        utils.INVALIDPLAYLIST('EXT-X-SESSION-KEY: The value of the METHOD attribute MUST NOT be NONE');
      }
      const sessionKey = new Key({
        method: attributes['METHOD'],
        uri: attributes['URI'],
        iv: attributes['IV'],
        format: attributes['KEYFORMAT'],
        formatVersion: attributes['KEYFORMATVERSIONS']
      });
      if (playlist.sessionKeyList.find(item => sameKey(item, sessionKey))) {
        utils.INVALIDPLAYLIST('A Master Playlist MUST NOT contain more than one EXT-X-SESSION-KEY tag with the same METHOD, URI, IV, KEYFORMAT, and KEYFORMATVERSIONS attribute values.');
      }
      setCompatibleVersionOfKey(params, attributes);
      playlist.sessionKeyList.push(sessionKey);
    } else if (name === 'EXT-X-INDEPENDENT-SEGMENTS') {
      if (playlist.independentSegments) {
        utils.INVALIDPLAYLIST('EXT-X-INDEPENDENT-SEGMENTS tag MUST NOT appear more than once in a Playlist');
      }
      playlist.independentSegments = true;
    } else if (name === 'EXT-X-START') {
      if (playlist.start) {
        utils.INVALIDPLAYLIST('EXT-X-START tag MUST NOT appear more than once in a Playlist');
      }
      if (typeof attributes['TIME-OFFSET'] !== 'number') {
        utils.INVALIDPLAYLIST('EXT-X-START: TIME-OFFSET attribute is REQUIRED');
      }
      playlist.start = {offset: attributes['TIME-OFFSET'], precise: attributes['PRECISE'] || false};
    }
  }
  return playlist;
}

function parseSegment(lines, uri, start, end, mediaSequenceNumber, discontinuitySequence, params) {
  const segment = new Segment({uri, mediaSequenceNumber, discontinuitySequence});
  for (let i = start; i <= end; i++) {
    const name = lines[i].name;
    const value = lines[i].value;
    const attributes = lines[i].attributes;
    if (name === 'EXTINF') {
      if (!Number.isInteger(value.duration) && params.compatibleVersion < 3) {
        params.compatibleVersion = 3;
      }
      if (Math.round(value.duration) > params.targetDuration) {
        utils.INVALIDPLAYLIST('EXTINF duration, when rounded to the nearest integer, MUST be less than or equal to the target duration');
      }
      segment.duration = value.duration;
      segment.title = value.title;
    } else if (name === 'EXT-X-BYTERANGE') {
      if (params.compatibleVersion < 4) {
        params.compatibleVersion = 4;
      }
      segment.byterange = value;
    } else if (name === 'EXT-X-DISCONTINUITY') {
      segment.discontinuity = true;
    } else if (name === 'EXT-X-KEY') {
      setCompatibleVersionOfKey(params, attributes);
      segment.key = new Key({
        method: attributes['METHOD'],
        uri: attributes['URI'],
        iv: attributes['IV'],
        format: attributes['KEYFORMAT'],
        formatVersion: attributes['KEYFORMATVERSIONS']
      });
    } else if (name === 'EXT-X-MAP') {
      if (params.compatibleVersion < 5) {
        params.compatibleVersion = 5;
      }
      params.hasMap = true;
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

function parseMediaPlaylist(lines, params) {
  const playlist = new MediaPlaylist();
  let segmentStart = -1;
  let mediaSequence = 0;
  let discontinuitySequence = 0;
  let key = null;
  let map = null;
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
      if (playlist.version === undefined) {
        playlist.version = value;
      } else {
        utils.INVALIDPLAYLIST('A Playlist file MUST NOT contain more than one EXT-X-VERSION tag.');
      }
    } else if (name === 'EXT-X-TARGETDURATION') {
      playlist.targetDuration = params.targetDuration = value;
    } else if (name === 'EXT-X-MEDIA-SEQUENCE') {
      if (playlist.segments.length > 0 || segmentStart !== -1) {
        utils.INVALIDPLAYLIST('The EXT-X-MEDIA-SEQUENCE tag MUST appear before the first Media Segment in the Playlist.');
      }
      playlist.mediaSequenceBase = mediaSequence = value;
    } else if (name === 'EXT-X-DISCONTINUITY-SEQUENCE') {
      if (playlist.segments.length > 0 || segmentStart !== -1) {
        utils.INVALIDPLAYLIST('The EXT-X-DISCONTINUITY-SEQUENCE tag MUST appear before the first Media Segment in the Playlist.');
      }
      playlist.discontinuitySequenceBase = discontinuitySequence = value;
    } else if (name === 'EXT-X-ENDLIST') {
      playlist.endlist = true;
    } else if (name === 'EXT-X-PLAYLIST-TYPE') {
      playlist.playlistType = value;
    } else if (name === 'EXT-X-I-FRAMES-ONLY') {
      if (params.compatibleVersion < 4) {
        params.compatibleVersion = 4;
      }
      playlist.isIFrame = true;
    } else if (name === 'EXT-X-INDEPENDENT-SEGMENTS') {
      if (playlist.independentSegments) {
        utils.INVALIDPLAYLIST('EXT-X-INDEPENDENT-SEGMENTS tag MUST NOT appear more than once in a Playlist');
      }
      playlist.independentSegments = true;
    } else if (name === 'EXT-X-START') {
      if (playlist.start) {
        utils.INVALIDPLAYLIST('EXT-X-START tag MUST NOT appear more than once in a Playlist');
      }
      if (typeof attributes['TIME-OFFSET'] !== 'number') {
        utils.INVALIDPLAYLIST('EXT-X-START: TIME-OFFSET attribute is REQUIRED');
      }
      playlist.start = {offset: attributes['TIME-OFFSET'], precise: attributes['PRECISE'] || false};
    } else if (typeof line === 'string') {
      // uri
      if (segmentStart === -1) {
        utils.INVALIDPLAYLIST('A URI line is not preceded by any segment tags');
      }
      if (!playlist.targetDuration) {
        utils.INVALIDPLAYLIST('The EXT-X-TARGETDURATION tag is REQUIRED');
      }
      const segment = parseSegment(lines, line, segmentStart, index - 1, mediaSequence++, discontinuitySequence, params);
      if (segment) {
        if (segment.discontinuity) {
          segment.discontinuitySequence = ++discontinuitySequence;
        }
        if (segment.key) {
          key = segment.key;
        } else if (key) {
          segment.key = key;
        }
        if (segment.map) {
          map = segment.map;
        } else if (map) {
          segment.map = map;
        }
        if (segment.byterange && segment.byterange.offset === -1) {
          const segments = playlist.segments;
          if (segments.length > 0) {
            const prevSegment = segments[segments.length - 1];
            if (prevSegment.byterange && prevSegment.uri === segment.uri) {
              segment.byterange.offset = prevSegment.byterange.offset + prevSegment.byterange.length;
            } else {
              utils.INVALIDPLAYLIST('If offset of EXT-X-BYTERANGE is not present, a previous Media Segment MUST be a sub-range of the same media resource');
            }
          } else {
            utils.INVALIDPLAYLIST('If offset of EXT-X-BYTERANGE is not present, a previous Media Segment MUST appear in the Playlist file');
          }
        }
        playlist.segments.push(segment);
      }
      segmentStart = -1;
    }
  }
  checkDateRange(playlist.segments);
  return playlist;
}

function checkDateRange(segments) {
  const earliestDates = new Map();
  const rangeList = new Map();
  let hasDateRange = false;
  let hasProgramDateTime = false;
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    if (segment.programDateTime) {
      hasProgramDateTime = true;
    }
    if (segment.dateRange) {
      hasDateRange = true;
      const dateRange = segment.dateRange;
      if (dateRange.endOnNext && (dateRange.end || dateRange.duration)) {
        utils.INVALIDPLAYLIST('An EXT-X-DATERANGE tag with an END-ON-NEXT=YES attribute MUST NOT contain DURATION or END-DATE attributes.');
      }
      const start = dateRange.start.getTime();
      const duration = dateRange.duration || 0;
      if (dateRange.end && dateRange.duration) {
        if ((start + duration * 1000) !== dateRange.end.getTime()) {
          utils.INVALIDPLAYLIST('END-DATE MUST be equal to the value of the START-DATE attribute plus the value of the DURATION');
        }
      }
      if (dateRange.endOnNext) {
        dateRange.end = earliestDates.get(dateRange.classId);
      }
      earliestDates.set(dateRange.classId, dateRange.start);
      const end = dateRange.end ? dateRange.end.getTime() : dateRange.start.getTime() + (dateRange.duration || 0) * 1000;
      const range = rangeList.get(dateRange.classId);
      if (range) {
        for (const entry of range) {
          if ((entry.start <= start && entry.end > start) || (entry.start >= start && entry.start < end)) {
            utils.INVALIDPLAYLIST('DATERANGE tags with the same CLASS should not overlap');
          }
        }
        range.push({start, end});
      } else {
        rangeList.set(dateRange.classId, [{start, end}]);
      }
    }
  }
  if (hasDateRange && !hasProgramDateTime) {
    utils.INVALIDPLAYLIST('If a Playlist contains an EXT-X-DATERANGE tag, it MUST also contain at least one EXT-X-PROGRAM-DATE-TIME tag.');
  }
}

function CHECKTAGCATEGORY(category, params) {
  if (category === 'Segment' || category === 'MediaPlaylist') {
    if (params.isMasterPlaylist === undefined) {
      params.isMasterPlaylist = false;
      return;
    }
    if (params.isMasterPlaylist) {
      MIXEDTAGS();
    }
    return;
  }
  if (category === 'MasterPlaylist') {
    if (params.isMasterPlaylist === undefined) {
      params.isMasterPlaylist = true;
      return;
    }
    if (params.isMasterPlaylist === false) {
      MIXEDTAGS();
    }
  }
  // category === 'Basic' or 'MediaorMasterPlaylist' or 'Unknown'
}

function parseTag(line, params) {
  const [name, param] = splitTag(line);
  const category = getTagCategory(name);
  CHECKTAGCATEGORY(category, params);
  if (category === 'Unknown') {
    return null;
  }
  if (category === 'MediaPlaylist') {
    if (params.hash[name]) {
      utils.INVALIDPLAYLIST('There MUST NOT be more than one Media Playlist tag of each type in any Media Playlist');
    }
    params.hash[name] = true;
  }
  const [value, attributes] = parseTagParam(name, param);
  return {name, category, value, attributes};
}

function lexicalParse(text, params) {
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
        const tag = parseTag(line, params);
        if (tag) {
          lines.push(tag);
        }
        return;
      }
      // comment
      return;
    }
    // uri
    lines.push(line);
  });
  if (lines.length === 0 || lines[0].name !== 'EXTM3U') {
    utils.INVALIDPLAYLIST('The EXTM3U tag MUST be the first line.');
  }
  return lines;
}

function semanticParse(lines, params) {
  let playlist;
  if (params.isMasterPlaylist) {
    playlist = parseMasterPlaylist(lines, params);
  } else {
    playlist = parseMediaPlaylist(lines, params);
    if (!playlist.isIFrame && params.hasMap && params.compatibleVersion < 6) {
      params.compatibleVersion = 6;
    }
  }
  if (params.compatibleVersion > 1) {
    if (!playlist.version || playlist.version < params.compatibleVersion) {
      utils.INVALIDPLAYLIST(`EXT-X-VERSION needs to be ${params.compatibleVersion} or higher.`);
    }
  }
  return playlist;
}

function parse(text) {
  const params = {
    version: undefined,
    isMasterPlaylist: undefined,
    hasMap: false,
    targetDuration: 0,
    compatibleVersion: 1,
    hash: {}
  };

  const lines = lexicalParse(text, params);
  const playlist = semanticParse(lines, params);
  playlist.source = text;
  return playlist;
}

module.exports = parse;
