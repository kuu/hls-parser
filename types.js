const utils = require('./utils');

class Rendition {
  constructor({
    type, // required
    uri, // required if type='SUBTITLES'
    groupId, // required
    language,
    assocLanguage,
    name, // required
    isDefault,
    autoselect,
    forced,
    instreamId, // required if type=CLOSED-CAPTIONS
    characteristics,
    channels
  }) {
    utils.PARAMCHECK(type, groupId, name);
    utils.CONDITIONALASSERT([type === 'SUBTITLES', uri], [type === 'CLOSED-CAPTIONS', instreamId], [type === 'CLOSED-CAPTIONS', !uri], [forced, type === 'SUBTITLES']);
    this.type = type;
    this.uri = uri;
    this.groupId = groupId;
    this.language = language;
    this.assocLanguage = assocLanguage;
    this.name = name;
    this.isDefault = isDefault;
    this.autoselect = autoselect;
    this.forced = forced;
    this.instreamId = instreamId;
    this.characteristics = characteristics;
    this.channels = channels;
  }
}

class Variant {
  constructor({
    uri, // required
    isIFrameOnly = false,
    bandwidth, // required
    averageBandwidth,
    codecs, // required?
    resolution,
    frameRate,
    hdcpLevel,
    audio = [],
    video = [],
    subtitles = [],
    closedCaptions = [],
    currentRenditions = {audio: 0, video: 0, subtitles: 0, closedCaptions: 0}
  }) {
    // utils.PARAMCHECK(uri, bandwidth, codecs);
    utils.PARAMCHECK(uri, bandwidth); // the spec states that CODECS is required but not true in the real world
    this.uri = uri;
    this.isIFrameOnly = isIFrameOnly;
    this.bandwidth = bandwidth;
    this.averageBandwidth = averageBandwidth;
    this.codecs = codecs;
    this.resolution = resolution;
    this.frameRate = frameRate;
    this.hdcpLevel = hdcpLevel;
    this.audio = audio;
    this.video = video;
    this.subtitles = subtitles;
    this.closedCaptions = closedCaptions;
    this.currentRenditions = currentRenditions;
  }
}

class SessionData {
  constructor({
    id, // required
    value,
    uri,
    language
  }) {
    utils.PARAMCHECK(id, value || uri);
    utils.ASSERT('SessionData cannot have both value and uri, shoud be either.', !(value && uri));
    this.id = id;
    this.value = value;
    this.uri = uri;
    this.language = language;
  }
}

class Key {
  constructor({
    method, // required
    uri, // required unless method=NONE
    iv,
    format,
    formatVersion
  }) {
    utils.PARAMCHECK(method);
    utils.CONDITIONALPARAMCHECK([method !== 'NONE', uri]);
    utils.CONDITIONALASSERT([method === 'NONE', !(uri || iv || format || formatVersion)]);
    this.method = method;
    this.uri = uri;
    this.iv = iv;
    this.format = format;
    this.formatVersion = formatVersion;
  }
}

class MediaInitializationSection {
  constructor({
    hint = false,
    uri, // required
    mimeType,
    byterange
  }) {
    utils.PARAMCHECK(uri);
    this.hint = hint;
    this.uri = uri;
    this.mimeType = mimeType;
    this.byterange = byterange;
  }
}

class DateRange {
  constructor({
    id, // required
    classId, // required if endOnNext is true
    start,
    end,
    duration,
    plannedDuration,
    endOnNext,
    attributes = {}
  }) {
    utils.PARAMCHECK(id);
    utils.CONDITIONALPARAMCHECK([endOnNext === true, classId]);
    utils.CONDITIONALASSERT([end, start], [end, start <= end], [duration, duration >= 0], [plannedDuration, plannedDuration >= 0]);
    this.id = id;
    this.classId = classId;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.plannedDuration = plannedDuration;
    this.endOnNext = endOnNext;
    this.attributes = attributes;
  }
}

class SpliceInfo {
  constructor({
    type, // required
    duration, // required if the type is 'OUT'
    tagName, // required if the type is 'RAW'
    value
  }) {
    utils.PARAMCHECK(type);
    utils.CONDITIONALPARAMCHECK([type === 'OUT', duration]);
    utils.CONDITIONALPARAMCHECK([type === 'RAW', tagName]);
    this.type = type;
    this.duration = duration;
    this.tagName = tagName;
    this.value = value;
  }
}

class Data {
  constructor(type) {
    utils.PARAMCHECK(type);
    this.type = type;
  }
}

class Playlist extends Data {
  constructor({
    isMasterPlaylist, // required
    uri,
    version,
    independentSegments = false,
    start,
    source
  }) {
    super('playlist');
    utils.PARAMCHECK(isMasterPlaylist);
    this.isMasterPlaylist = isMasterPlaylist;
    this.uri = uri;
    this.version = version;
    this.independentSegments = independentSegments;
    this.start = start;
    this.source = source;
  }
}

class MasterPlaylist extends Playlist {
  constructor(params = {}) {
    params.isMasterPlaylist = true;
    super(params);
    const {
      variants = [],
      currentVariant,
      sessionDataList = [],
      sessionKeyList = []
    } = params;
    this.variants = variants;
    this.currentVariant = currentVariant;
    this.sessionDataList = sessionDataList;
    this.sessionKeyList = sessionKeyList;
  }
}

class MediaPlaylist extends Playlist {
  constructor(params = {}) {
    params.isMasterPlaylist = false;
    super(params);
    const {
      targetDuration,
      mediaSequenceBase = 0,
      discontinuitySequenceBase = 0,
      endlist = false,
      playlistType,
      isIFrame,
      segments = [],
      lowLatencyCompatibility,
      partTargetDuration,
      renditionReports = [],
      skip = 0,
      hash
    } = params;
    this.targetDuration = targetDuration;
    this.mediaSequenceBase = mediaSequenceBase;
    this.discontinuitySequenceBase = discontinuitySequenceBase;
    this.endlist = endlist;
    this.playlistType = playlistType;
    this.isIFrame = isIFrame;
    this.segments = segments;
    this.lowLatencyCompatibility = lowLatencyCompatibility;
    this.partTargetDuration = partTargetDuration;
    this.renditionReports = renditionReports;
    this.skip = skip;
    this.hash = hash;
  }
}

class Segment extends Data {
  constructor({
    uri,
    mimeType,
    data,
    duration,
    title,
    byterange,
    discontinuity,
    mediaSequenceNumber = 0,
    discontinuitySequence = 0,
    key,
    map,
    programDateTime,
    dateRange,
    markers = [],
    parts = []
  }) {
    super('segment');
    // utils.PARAMCHECK(uri, mediaSequenceNumber, discontinuitySequence);
    this.uri = uri;
    this.mimeType = mimeType;
    this.data = data;
    this.duration = duration;
    this.title = title;
    this.byterange = byterange;
    this.discontinuity = discontinuity;
    this.mediaSequenceNumber = mediaSequenceNumber;
    this.discontinuitySequence = discontinuitySequence;
    this.key = key;
    this.map = map;
    this.programDateTime = programDateTime;
    this.dateRange = dateRange;
    this.markers = markers;
    this.parts = parts;
  }
}

class PartialSegment extends Data {
  constructor({
    hint = false,
    uri, // required
    duration,
    independent,
    byterange,
    gap
  }) {
    super('part');
    utils.PARAMCHECK(uri);
    this.hint = hint;
    this.uri = uri;
    this.duration = duration;
    this.independent = independent;
    this.duration = duration;
    this.byterange = byterange;
    this.gap = gap;
  }
}

class RenditionReport {
  constructor({
    uri, // required
    lastMSN,
    lastPart
  }) {
    utils.PARAMCHECK(uri);
    this.uri = uri;
    this.lastMSN = lastMSN;
    this.lastPart = lastPart;
  }
}

module.exports = {
  Rendition,
  Variant,
  SessionData,
  Key,
  MediaInitializationSection,
  DateRange,
  SpliceInfo,
  Playlist,
  MasterPlaylist,
  MediaPlaylist,
  Segment,
  PartialSegment,
  RenditionReport
};
