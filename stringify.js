const utils = require('./utils');

const ALLOW_REDUNDANCY = [
  '#EXTINF',
  '#EXT-X-BYTERANGE',
  '#EXT-X-DISCONTINUITY',
  '#EXT-X-STREAM-INF',
  '#EXT-X-CUE-OUT',
  '#EXT-X-CUE-IN'
];

const SKIP_IF_REDUNDANT = [
  '#EXT-X-KEY',
  '#EXT-X-MAP',
  '#EXT-X-MEDIA'
];

class LineArray extends Array {
  constructor(baseUri) {
    super();
    this.baseUri = baseUri;
  }

  // @override
  push(...elems) {
    // redundancy check
    for (const elem of elems) {
      if (!elem.startsWith('#')) {
        super.push(elem);
        continue;
      }
      if (ALLOW_REDUNDANCY.some(item => elem.startsWith(item))) {
        super.push(elem);
        continue;
      }
      if (this.includes(elem)) {
        if (SKIP_IF_REDUNDANT.some(item => elem.startsWith(item))) {
          continue;
        }
        utils.INVALIDPLAYLIST(`Redundant item (${elem})`);
      }
      super.push(elem);
    }
  }
}

function buildDecimalFloatingNumber(num, fixed) {
  let roundFactor = 1000;
  if (fixed) {
    roundFactor = 10 ** fixed;
  }
  const rounded = Math.round(num * roundFactor) / roundFactor;
  return fixed ? rounded.toFixed(fixed) : rounded;
}

function getNumberOfDecimalPlaces(num) {
  const str = num.toString(10);
  const index = str.indexOf('.');
  if (index === -1) {
    return 0;
  }
  return str.length - index - 1;
}

function buildMasterPlaylist(lines, playlist) {
  for (const sessionData of playlist.sessionDataList) {
    buildSessionData(lines, sessionData);
  }
  for (const sessionKey of playlist.sessionKeyList) {
    buildKey(lines, sessionKey, true);
  }
  for (const variant of playlist.variants) {
    buildVariant(lines, variant);
  }
}

function buildSessionData(lines, sessionData) {
  const attrs = [`DATA-ID="${sessionData.id}"`];
  if (sessionData.language) {
    attrs.push(`LANGUAGE="${sessionData.language}"`);
  }
  if (sessionData.value) {
    attrs.push(`VALUE="${sessionData.value}"`);
  } else if (sessionData.uri) {
    attrs.push(`URI="${sessionData.uri}"`);
  }
  lines.push(`#EXT-X-SESSION-DATA:${attrs.join(',')}`);
}

function buildKey(lines, key, isSessionKey) {
  const name = isSessionKey ? '#EXT-X-SESSION-KEY' : '#EXT-X-KEY';
  const attrs = [`METHOD=${key.method}`];
  if (key.uri) {
    attrs.push(`URI="${key.uri}"`);
  }
  if (key.iv) {
    if (key.iv.length !== 16) {
      utils.INVALIDPLAYLIST('IV must be a 128-bit unsigned integer');
    }
    attrs.push(`IV=${utils.byteSequenceToHex(key.iv)}`);
  }
  if (key.format) {
    attrs.push(`KEYFORMAT="${key.format}"`);
  }
  if (key.formatVersion) {
    attrs.push(`KEYFORMATVERSIONS="${key.formatVersion}"`);
  }
  lines.push(`${name}:${attrs.join(',')}`);
}

function buildVariant(lines, variant) {
  const name = variant.isIFrameOnly ? '#EXT-X-I-FRAME-STREAM-INF' : '#EXT-X-STREAM-INF';
  const attrs = [`BANDWIDTH=${variant.bandwidth}`];
  if (variant.averageBandwidth) {
    attrs.push(`AVERAGE-BANDWIDTH=${variant.averageBandwidth}`);
  }
  if (variant.isIFrameOnly) {
    attrs.push(`URI="${variant.uri}"`);
  }
  if (variant.codecs) {
    attrs.push(`CODECS="${variant.codecs}"`);
  }
  if (variant.resolution) {
    attrs.push(`RESOLUTION=${variant.resolution.width}x${variant.resolution.height}`);
  }
  if (variant.frameRate) {
    attrs.push(`FRAME-RATE=${buildDecimalFloatingNumber(variant.frameRate, 3)}`);
  }
  if (variant.hdcpLevel) {
    attrs.push(`HDCP-LEVEL=${variant.hdcpLevel}`);
  }
  if (variant.audio.length > 0) {
    attrs.push(`AUDIO="${variant.audio[0].groupId}"`);
    for (const rendition of variant.audio) {
      buildRendition(lines, rendition);
    }
  }
  if (variant.video.length > 0) {
    attrs.push(`VIDEO="${variant.video[0].groupId}"`);
    for (const rendition of variant.video) {
      buildRendition(lines, rendition);
    }
  }
  if (variant.subtitles.length > 0) {
    attrs.push(`SUBTITLES="${variant.subtitles[0].groupId}"`);
    for (const rendition of variant.subtitles) {
      buildRendition(lines, rendition);
    }
  }
  if (utils.getOptions().allowClosedCaptionsNone && variant.closedCaptions.length === 0) {
    attrs.push(`CLOSED-CAPTIONS=NONE`);
  } else if (variant.closedCaptions.length > 0) {
    attrs.push(`CLOSED-CAPTIONS="${variant.closedCaptions[0].groupId}"`);
    for (const rendition of variant.closedCaptions) {
      buildRendition(lines, rendition);
    }
  }
  lines.push(`${name}:${attrs.join(',')}`);
  if (!variant.isIFrameOnly) {
    lines.push(`${variant.uri}`);
  }
}

function buildRendition(lines, rendition) {
  const attrs = [
    `TYPE=${rendition.type}`,
    `GROUP-ID="${rendition.groupId}"`,
    `NAME="${rendition.name}"`
  ];
  if (rendition.isDefault !== undefined) {
    attrs.push(`DEFAULT=${rendition.isDefault ? 'YES' : 'NO'}`);
  }
  if (rendition.autoselect !== undefined) {
    attrs.push(`AUTOSELECT=${rendition.autoselect ? 'YES' : 'NO'}`);
  }
  if (rendition.forced !== undefined) {
    attrs.push(`FORCED=${rendition.forced ? 'YES' : 'NO'}`);
  }
  if (rendition.language) {
    attrs.push(`LANGUAGE="${rendition.language}"`);
  }
  if (rendition.assocLanguage) {
    attrs.push(`ASSOC-LANGUAGE="${rendition.assocLanguage}"`);
  }
  if (rendition.instreamId) {
    attrs.push(`INSTREAM-ID="${rendition.instreamId}"`);
  }
  if (rendition.characteristics) {
    attrs.push(`CHARACTERISTICS="${rendition.characteristics}"`);
  }
  if (rendition.channels) {
    attrs.push(`CHANNELS="${rendition.channels}"`);
  }
  if (rendition.uri) {
    attrs.push(`URI="${rendition.uri}"`);
  }
  lines.push(`#EXT-X-MEDIA:${attrs.join(',')}`);
}

function buildMediaPlaylist(lines, playlist) {
  if (playlist.targetDuration) {
    lines.push(`#EXT-X-TARGETDURATION:${playlist.targetDuration}`);
  }
  if (playlist.lowLatencyCompatibility) {
    const {canBlockReload, canSkipUntil, holdBack, partHoldBack} = playlist.lowLatencyCompatibility;
    const params = [];
    params.push(`CAN-BLOCK-RELOAD=${canBlockReload ? 'YES' : 'NO'}`);
    if (canSkipUntil !== undefined) {
      params.push(`CAN-SKIP-UNTIL=${canSkipUntil}`);
    }
    if (holdBack !== undefined) {
      params.push(`HOLD-BACK=${holdBack}`);
    }
    if (partHoldBack !== undefined) {
      params.push(`PART-HOLD-BACK=${partHoldBack}`);
    }
    lines.push(`#EXT-X-SERVER-CONTROL:${params.join(',')}`);
  }
  if (playlist.partTargetDuration) {
    lines.push(`#EXT-X-PART-INF:PART-TARGET=${playlist.partTargetDuration}`);
  }
  if (playlist.mediaSequenceBase) {
    lines.push(`#EXT-X-MEDIA-SEQUENCE:${playlist.mediaSequenceBase}`);
  }
  if (playlist.discontinuitySequenceBase) {
    lines.push(`#EXT-X-DISCONTINUITY-SEQUENCE:${playlist.discontinuitySequenceBase}`);
  }
  if (playlist.playlistType) {
    lines.push(`#EXT-X-PLAYLIST-TYPE:${playlist.playlistType}`);
  }
  if (playlist.isIFrame) {
    lines.push(`#EXT-X-I-FRAMES-ONLY`);
  }
  if (playlist.skip > 0) {
    lines.push(`#EXT-X-SKIP:SKIPPED-SEGMENTS=${playlist.skip}`);
  }
  for (const segment of playlist.segments) {
    buildSegment(lines, segment, playlist.version);
  }
  if (playlist.endlist) {
    lines.push(`#EXT-X-ENDLIST`);
  }
  for (const report of playlist.renditionReports) {
    const params = [];
    params.push(`URI="${report.uri}"`);
    params.push(`LAST-MSN=${report.lastMSN}`);
    if (report.lastPart !== undefined) {
      params.push(`LAST-PART=${report.lastPart}`);
    }
    lines.push(`#EXT-X-RENDITION-REPORT:${params.join(',')}`);
  }
}

function buildSegment(lines, segment, version = 1) {
  let hint = false;
  if (segment.byterange) {
    lines.push(`#EXT-X-BYTERANGE:${buildByteRange(segment.byterange)}`);
  }
  if (segment.discontinuity) {
    lines.push(`#EXT-X-DISCONTINUITY`);
  }
  if (segment.key) {
    buildKey(lines, segment.key);
  }
  if (segment.map) {
    buildMap(lines, segment.map);
  }
  if (segment.programDateTime) {
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${utils.formatDate(segment.programDateTime)}`);
  }
  if (segment.dateRange) {
    buildDateRange(lines, segment.dateRange);
  }
  if (segment.markers.length > 0) {
    buildMarkers(lines, segment.markers);
  }
  if (segment.parts.length > 0) {
    hint = buildParts(lines, segment.parts);
  }
  if (hint) {
    return;
  }
  const duration = version < 3 ? Math.round(segment.duration) : buildDecimalFloatingNumber(segment.duration, getNumberOfDecimalPlaces(segment.duration));
  lines.push(`#EXTINF:${duration},${unescape(encodeURIComponent(segment.title || ''))}`);
  Array.prototype.push.call(lines, `${segment.uri}`); // URIs could be redundant when EXT-X-BYTERANGE is used
}

function buildMap(lines, map) {
  const attrs = [`URI="${map.uri}"`];
  if (map.byterange) {
    attrs.push(`BYTERANGE="${buildByteRange(map.byterange)}"`);
  }
  lines.push(`#EXT-X-MAP:${attrs.join(',')}`);
}

function buildByteRange({offset, length}) {
  return `${length}@${offset}`;
}

function buildDateRange(lines, dateRange) {
  const attrs = [
    `ID="${dateRange.id}"`,
    `START-DATE="${utils.formatDate(dateRange.start)}"`
  ];
  if (dateRange.end) {
    attrs.push(`END-DATE="${dateRange.end}"`);
  }
  if (dateRange.duration) {
    attrs.push(`DURATION=${dateRange.duration}`);
  }
  if (dateRange.plannedDuration) {
    attrs.push(`PLANNED-DURATION=${dateRange.plannedDuration}`);
  }
  if (dateRange.classId) {
    attrs.push(`CLASS="${dateRange.classId}"`);
  }
  if (dateRange.endOnNext) {
    attrs.push(`END-ON-NEXT=YES`);
  }
  Object.keys(dateRange.attributes).forEach(key => {
    if (key.startsWith('X-')) {
      if (typeof dateRange.attributes[key] === 'number') {
        attrs.push(`${key}=${dateRange.attributes[key]}`);
      } else {
        attrs.push(`${key}="${dateRange.attributes[key]}"`);
      }
    } else if (key.startsWith('SCTE35-')) {
      attrs.push(`${key}=${utils.byteSequenceToHex(dateRange.attributes[key])}`);
    }
  });
  lines.push(`#EXT-X-DATERANGE:${attrs.join(',')}`);
}

function buildMarkers(lines, markers) {
  for (const marker of markers) {
    if (marker.type === 'OUT') {
      lines.push(`#EXT-X-CUE-OUT:${marker.duration}`);
    } else if (marker.type === 'IN') {
      lines.push('#EXT-X-CUE-IN');
    } else if (marker.type === 'RAW') {
      const value = marker.value ? `:${marker.value}` : '';
      lines.push(`#${marker.tagName}${value}`);
    }
  }
}

function buildParts(lines, parts) {
  let hint = false;
  for (const part of parts) {
    if (part.hint) {
      const params = [];
      params.push('TYPE=PART');
      params.push(`URI="${part.uri}"`);
      if (part.byterange) {
        const {offset, length} = part.byterange;
        params.push(`BYTERANGE-START=${offset}`);
        if (length) {
          params.push(`BYTERANGE-LENGTH=${length}`);
        }
      }
      lines.push(`#EXT-X-PRELOAD-HINT:${params.join(',')}`);
      hint = true;
    } else {
      const params = [];
      params.push(`DURATION=${part.duration}`);
      params.push(`URI="${part.uri}"`);
      if (part.byterange) {
        params.push(`BYTERANGE=${buildByteRange(part.byterange)}`);
      }
      if (part.independent) {
        params.push('INDEPENDENT=YES');
      }
      if (part.gap) {
        params.push('GAP=YES');
      }
      lines.push(`#EXT-X-PART:${params.join(',')}`);
    }
  }
  return hint;
}

function stringify(playlist) {
  utils.PARAMCHECK(playlist);
  utils.ASSERT('Not a playlist', playlist.type === 'playlist');
  const lines = new LineArray(playlist.uri);
  lines.push('#EXTM3U');
  if (playlist.version) {
    lines.push(`#EXT-X-VERSION:${playlist.version}`);
  }
  if (playlist.independentSegments) {
    lines.push('#EXT-X-INDEPENDENT-SEGMENTS');
  }
  if (playlist.start) {
    lines.push(`#EXT-X-START:TIME-OFFSET=${buildDecimalFloatingNumber(playlist.start.offset)}${playlist.start.precise ? ',PRECISE=YES' : ''}`);
  }
  if (playlist.isMasterPlaylist) {
    buildMasterPlaylist(lines, playlist);
  } else {
    buildMediaPlaylist(lines, playlist);
  }
  // console.log('<<<');
  // console.log(lines.join('\n'));
  // console.log('>>>');
  return lines.join('\n');
}

module.exports = stringify;
