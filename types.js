const utils = require('./utils');

class Rendition {
  constructor({
    type, // required
    uri, // required if type='SUBTITLES'
    groupId, // required
    language,
    assocLanguage,
    name, // required
    isDefault = false,
    autoselect = false,
    forced = false,
    instreamId, // required if type=CLOSED-CAPTIONS
    characteristics,
    channels
  }) {
    utils.PARAMCHECK(type, groupId, name);
    utils.CONDITIONALPARAMCHECK([type === 'SUBTITLES', uri], [type === 'CLOSED-CAPTIONS', instreamId]);
    this.type = type;
    this.uri = uri;
    this.groupId = groupId;
    this.language = language;
    this.assocLanguage = assocLanguage;
    this.name = name;
    this.isDefault = isDefault;
    this.autoselect = isDefault ? isDefault : autoselect;
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
    currentRenditions = {AUDIO: 0, VIDEO: 0, SUBTITLES: 0, 'CLOSED-CAPTIONS': 0}
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
    format = 'identity',
    formatVersion = '1'
  }) {
    utils.PARAMCHECK(method);
    utils.CONDITIONALPARAMCHECK([method !== 'NONE', uri]);
    this.method = method;
    this.uri = uri;
    this.iv = iv;
    this.format = format;
    this.formatVersion = formatVersion;
  }
}

class MediaInitializationSection {
  constructor({
    uri, // required
    mimeType,
    byterange
  }) {
    utils.PARAMCHECK(uri);
    this.uri = uri;
    this.mimeType = mimeType;
    this.byterange = byterange;
  }
}

class DateRange {
  constructor({
    id, // required
    classId, // required if endOnNext is true
    start, // required
    end,
    duration,
    plannedDuration,
    endOnNext,
    attributes = {}
  }) {
    utils.PARAMCHECK(id, start);
    utils.CONDITIONALPARAMCHECK([endOnNext === true, classId]);
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

class Data {
  constructor(type) {
    utils.PARAMCHECK(type);
    this.type = type;
  }
}

class Playlist extends Data {
  constructor({
    isMasterPlaylist, // required
    uri, // required
    version,
    independentSegments = false,
    offset = 0.0,
    source
  }) {
    super('playlist');
    utils.PARAMCHECK(isMasterPlaylist, uri);
    this.isMasterPlaylist = isMasterPlaylist;
    this.uri = uri;
    this.version = version;
    this.independentSegments = independentSegments;
    this.offset = offset;
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
      sessionKey
    } = params;
    this.variants = variants;
    this.currentVariant = currentVariant;
    this.sessionDataList = sessionDataList;
    this.sessionKey = sessionKey;
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
      hash
    } = params;
    this.targetDuration = targetDuration;
    this.mediaSequenceBase = mediaSequenceBase;
    this.discontinuitySequenceBase = discontinuitySequenceBase;
    this.endlist = endlist;
    this.playlistType = playlistType;
    this.isIFrame = isIFrame;
    this.segments = segments;
    this.hash = hash;
  }
}

class Segment extends Data {
  constructor({
    uri, // required
    mimeType,
    data,
    duration,
    title,
    byterange,
    discontinuity,
    mediaSequenceNumber,
    discontinuitySequence,
    key,
    map,
    programDateTime,
    dateRange
  }) {
    super('segment');
    utils.PARAMCHECK(uri, mediaSequenceNumber, discontinuitySequence);
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
  }
}

module.exports = {
  Rendition,
  Variant,
  SessionData,
  Key,
  MediaInitializationSection,
  DateRange,
  Playlist,
  MasterPlaylist,
  MediaPlaylist,
  Segment
};
