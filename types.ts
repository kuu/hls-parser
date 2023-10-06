import * as utils from './utils';

type RenditionType = 'AUDIO' | 'VIDEO' | 'SUBTITLES' | 'CLOSED-CAPTIONS';

class Rendition {
  type: RenditionType;
  uri?: string;
  groupId: string;
  language?: string;
  assocLanguage?: string;
  name: string;
  isDefault: boolean;
  autoselect: boolean;
  forced: boolean;
  instreamId?: string;
  characteristics?: string;
  channels?: string;

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
  }: Rendition) {
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
  uri: string;
  isIFrameOnly?: boolean;
  bandwidth: number;
  averageBandwidth?: number;
  score: number;
  codecs?: string;
  resolution?: { width: number; height: number };
  frameRate?: number;
  hdcpLevel?: string;
  allowedCpc: { format: string, cpcList: string[] }[];
  videoRange: 'SDR' | 'HLG' | 'PQ';
  stableVariantId: string;
  programId: any;
  audio: Rendition[];
  video: Rendition[];
  subtitles: Rendition[];
  closedCaptions: Rendition[];
  currentRenditions: { audio: number; video: number; subtitles: number; closedCaptions: number; };

  constructor({
    uri, // required
    isIFrameOnly = false,
    bandwidth, // required
    averageBandwidth,
    score,
    codecs, // required?
    resolution,
    frameRate,
    hdcpLevel,
    allowedCpc,
    videoRange,
    stableVariantId,
    programId,
    audio = [],
    video = [],
    subtitles = [],
    closedCaptions = [],
    currentRenditions = {audio: 0, video: 0, subtitles: 0, closedCaptions: 0}
  }: any) {
    // utils.PARAMCHECK(uri, bandwidth, codecs);
    utils.PARAMCHECK(uri, bandwidth); // the spec states that CODECS is required but not true in the real world
    this.uri = uri;
    this.isIFrameOnly = isIFrameOnly;
    this.bandwidth = bandwidth;
    this.averageBandwidth = averageBandwidth;
    this.score = score;
    this.codecs = codecs;
    this.resolution = resolution;
    this.frameRate = frameRate;
    this.hdcpLevel = hdcpLevel;
    this.allowedCpc = allowedCpc;
    this.videoRange = videoRange;
    this.stableVariantId = stableVariantId;
    this.programId = programId;
    this.audio = audio;
    this.video = video;
    this.subtitles = subtitles;
    this.closedCaptions = closedCaptions;
    this.currentRenditions = currentRenditions;
  }
}

class SessionData {
  id: string;
  value?: string;
  uri?: string;
  language?: string;

  constructor({
    id, // required
    value,
    uri,
    language
  }: SessionData) {
    utils.PARAMCHECK(id, value || uri);
    utils.ASSERT('SessionData cannot have both value and uri, shoud be either.', !(value && uri));
    this.id = id;
    this.value = value;
    this.uri = uri;
    this.language = language;
  }
}

class Key {
  method: string;
  uri?: string;
  iv?: Buffer;
  format?: string;
  formatVersion?: string;

  constructor({
    method, // required
    uri, // required unless method=NONE
    iv,
    format,
    formatVersion
  }: Key) {
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

export type Byterange = {
  length: number;
  offset: number;
};

class MediaInitializationSection {
  hint: boolean;
  uri: string;
  mimeType?: string;
  byterange?: Byterange;

  constructor({
    hint = false,
    uri, // required
    mimeType,
    byterange
  }: Partial<MediaInitializationSection> & {uri: string}) {
    utils.PARAMCHECK(uri);
    this.hint = hint;
    this.uri = uri;
    this.mimeType = mimeType;
    this.byterange = byterange;
  }
}

class DateRange {
  id: string;
  classId?: string;
  start?: Date;
  end?: Date;
  duration?: number;
  plannedDuration?: number;
  endOnNext?: boolean;
  attributes: Record<string, any>;

  constructor({
    id, // required
    classId, // required if endOnNext is true
    start,
    end,
    duration,
    plannedDuration,
    endOnNext,
    attributes = {}
  }: DateRange) {
    utils.PARAMCHECK(id);
    utils.CONDITIONALPARAMCHECK([endOnNext === true, classId]);
    utils.CONDITIONALASSERT([end, start], [end, start! <= end!], [duration, duration! >= 0], [plannedDuration, plannedDuration! >= 0]);
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
  type: string;
  duration?: number;
  tagName?: string;
  value?: any;

  constructor({
    type, // required
    duration, // required if the type is 'OUT'
    tagName, // required if the type is 'RAW'
    value
  }: SpliceInfo) {
    utils.PARAMCHECK(type);
    utils.CONDITIONALPARAMCHECK([type === 'OUT', duration]);
    utils.CONDITIONALPARAMCHECK([type === 'RAW', tagName]);
    this.type = type;
    this.duration = duration;
    this.tagName = tagName;
    this.value = value;
  }
}

type DataType = 'part' | 'playlist' | 'prefetch' | 'segment';

class Data {
  type: DataType;

  constructor(type: DataType) {
    utils.PARAMCHECK(type);
    this.type = type;
  }
}

class Playlist extends Data {
  isMasterPlaylist: boolean;
  uri?: string;
  version?: number;
  independentSegments: boolean;
  start?: { offset: number; precise: boolean };
  source?: string;

  constructor({
    isMasterPlaylist, // required
    uri,
    version,
    independentSegments = false,
    start,
    source
  }: Partial<Playlist> & { isMasterPlaylist: boolean }) {
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
  variants: Variant[];
  currentVariant?: number;
  sessionDataList: SessionData[];
  sessionKeyList: Key[];

  constructor(params: Partial<MasterPlaylist> = {}) {
    super({...params, isMasterPlaylist: true});
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

type LowLatencyCompatibility = {
  canBlockReload: boolean,
  canSkipUntil: number,
  holdBack: number,
  partHoldBack: number,
};

class MediaPlaylist extends Playlist {
  targetDuration: number;
  mediaSequenceBase?: number;
  discontinuitySequenceBase?: number;
  endlist: boolean;
  playlistType?: 'EVENT' | 'VOD';
  isIFrame?: boolean;
  segments: Segment[];
  prefetchSegments: PrefetchSegment[];
  lowLatencyCompatibility?: LowLatencyCompatibility;
  partTargetDuration?: number;
  renditionReports: RenditionReport[];
  skip: number;
  hash?: Record<string, any>;

  constructor(params: Partial<MediaPlaylist> = {}) {
    super({...params, isMasterPlaylist: false});
    const {
      targetDuration,
      mediaSequenceBase = 0,
      discontinuitySequenceBase = 0,
      endlist = false,
      playlistType,
      isIFrame,
      segments = [],
      prefetchSegments = [],
      lowLatencyCompatibility,
      partTargetDuration,
      renditionReports = [],
      skip = 0,
      hash
    } = params;
    this.targetDuration = targetDuration!;
    this.mediaSequenceBase = mediaSequenceBase;
    this.discontinuitySequenceBase = discontinuitySequenceBase;
    this.endlist = endlist;
    this.playlistType = playlistType;
    this.isIFrame = isIFrame;
    this.segments = segments;
    this.prefetchSegments = prefetchSegments;
    this.lowLatencyCompatibility = lowLatencyCompatibility;
    this.partTargetDuration = partTargetDuration;
    this.renditionReports = renditionReports;
    this.skip = skip;
    this.hash = hash;
  }
}

class Segment extends Data {
  uri: string;
  mimeType: string;
  data: any;
  duration: number;
  title?: string;
  byterange: Byterange;
  discontinuity?: boolean;
  mediaSequenceNumber: number;
  discontinuitySequence: number;
  key?: Key;
  map: MediaInitializationSection;
  programDateTime?: Date;
  dateRange: DateRange;
  markers: SpliceInfo[];
  parts: PartialSegment[];

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
  }: any) {
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
  hint: boolean;
  uri: string;
  duration?: number;
  independent?: boolean;
  byterange?: Byterange;
  gap?: boolean;

  constructor({
    hint = false,
    uri, // required
    duration,
    independent,
    byterange,
    gap
  }: Omit<PartialSegment, 'type'>) {
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

class PrefetchSegment extends Data {
  uri: string;
  discontinuity?: boolean;
  mediaSequenceNumber: number;
  discontinuitySequence: number;
  key?: Key | null;

  constructor({
    uri, // required
    discontinuity,
    mediaSequenceNumber = 0,
    discontinuitySequence = 0,
    key
  }: Omit<PrefetchSegment, 'type'>) {
    super('prefetch');
    utils.PARAMCHECK(uri);
    this.uri = uri;
    this.discontinuity = discontinuity;
    this.mediaSequenceNumber = mediaSequenceNumber;
    this.discontinuitySequence = discontinuitySequence;
    this.key = key;
  }
}

class RenditionReport {
  uri: string;
  lastMSN?: number;
  lastPart: number;

  constructor({
    uri, // required
    lastMSN,
    lastPart
  }: RenditionReport) {
    utils.PARAMCHECK(uri);
    this.uri = uri;
    this.lastMSN = lastMSN;
    this.lastPart = lastPart;
  }
}

export {
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
  PrefetchSegment,
  RenditionReport
};
