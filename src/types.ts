import * as utils from './utils';

export interface LowLatencyCompatibility {
    canBlockReload: boolean;
    canSkipUntil: boolean;
    holdBack: boolean;
    partHoldBack: boolean;
}

export interface ByteRange {
    length: number;
    offset: number;
}

export interface Resolution {
    width: number;
    height: number;
}

export interface RenditionProperties {
    type: string;
    uri: string;
    groupId: string;
    language: string;
    assocLanguage: string;
    name: string;
    isDefault: string;
    autoselect: string;
    forced: boolean;
    instreamId: string;
    characteristics: string;
    channels: string;
}

export type RenditionConstructorOptionalProperties = Partial<
    Pick<RenditionProperties, 'uri' | 'language' | 'assocLanguage' | 'isDefault' | 'autoselect' | 'forced' | 'channels'>
>;

export type RenditionConstructorRequiredProperties = Pick<
    RenditionProperties,
    'type' | 'groupId' | 'name' | 'instreamId'
>;

export type RenditionConstructorProperties = RenditionConstructorOptionalProperties &
    RenditionConstructorRequiredProperties;

export class Rendition implements RenditionProperties {
    public type: string;
    public uri: string;
    public groupId: string;
    public language: string;
    public assocLanguage: string;
    public name: string;
    public isDefault: string;
    public autoselect: string;
    public forced: boolean;
    public instreamId: string;
    public characteristics: string;
    public channels: string;

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
        channels,
    }: RenditionProperties) {
        utils.PARAMCHECK(type, groupId, name);
        utils.CONDITIONALASSERT(
            [type === 'SUBTITLES', uri],
            [type === 'CLOSED-CAPTIONS', instreamId],
            [type === 'CLOSED-CAPTIONS', !uri],
            [forced, type === 'SUBTITLES'],
        );
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

export interface VariantCurrentRendition {
    audio: number;
    video: number;
    subtitles: number;
    closedCaptions: number;
}

export interface VariantProperties {
    uri: string;
    isIFrameOnly: boolean;
    bandwidth: number;
    averageBandwidth: number;
    score: number;
    codecs: string[];
    resolution: Resolution;
    frameRate: number;
    hdcpLevel: string;
    allowedCpc: boolean;
    videoRange: string;
    stableVariantId: string;
    audio: string[];
    video: string[];
    subtitles: string[];
    closedCaptions: Rendition[];
    currentRenditions: VariantCurrentRendition;
}

export type VariantConstructorOptionalProperties = Partial<
    Pick<
        VariantProperties,
        | 'isIFrameOnly'
        | 'averageBandwidth'
        | 'score'
        | 'resolution'
        | 'frameRate'
        | 'hdcpLevel'
        | 'allowedCpc'
        | 'videoRange'
        | 'stableVariantId'
        | 'audio'
        | 'video'
        | 'subtitles'
        | 'closedCaptions'
        | 'currentRenditions'
        | 'codecs'
    >
>;

export type VariantConstructorRequiredProperties = Pick<VariantProperties, 'uri' | 'bandwidth'>;

export type VariantConstructorProperties = VariantConstructorOptionalProperties & VariantConstructorRequiredProperties;

export class Variant implements VariantProperties {
    public uri: string;
    public isIFrameOnly: boolean;
    public bandwidth: number;
    public averageBandwidth: number;
    public score: number;
    public codecs: string[];
    public resolution: Resolution;
    public frameRate: number;
    public hdcpLevel: string;
    public allowedCpc: boolean;
    public videoRange: string;
    public stableVariantId: string;
    public audio: string[];
    public video: string[];
    public subtitles: string[];
    public closedCaptions: Rendition[];
    public currentRenditions: VariantCurrentRendition;

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
        audio = [],
        video = [],
        subtitles = [],
        closedCaptions = [],
        currentRenditions = { audio: 0, video: 0, subtitles: 0, closedCaptions: 0 },
    }: VariantConstructorProperties) {
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
        this.audio = audio;
        this.video = video;
        this.subtitles = subtitles;
        this.closedCaptions = closedCaptions;
        this.currentRenditions = currentRenditions;
    }
}

export interface SessionDataProperties {
    id: string;
    value: string;
    uri: string;
    language: string;
}

export type SessionDataOptionalConstructorProperties = Partial<
    Pick<SessionDataProperties, 'value' | 'uri' | 'language'>
>;
export type SessionDataRequiredConstructorProperties = Pick<SessionDataProperties, 'id'>;
export type SessionDataConstructorProperties = SessionDataOptionalConstructorProperties &
    SessionDataRequiredConstructorProperties;

export class SessionData implements SessionDataProperties {
    public id: string;
    public value: string;
    public uri: string;
    public language: string;
    constructor({ id, value, uri, language }: SessionDataConstructorProperties) {
        utils.PARAMCHECK(id, value || uri);
        utils.ASSERT('SessionData cannot have both value and uri, shoud be either.', !(value && uri));
        this.id = id;
        this.value = value;
        this.uri = uri;
        this.language = language;
    }
}

export interface KeyProperties {
    method: string;
    uri: string;
    iv: Buffer;
    format: string;
    formatVersion: string;
}

export type KeyOptionalConstructorProperties = Partial<Pick<KeyProperties, 'uri' | 'iv' | 'format' | 'formatVersion'>>;
export type KeyRequiredConstructorProperties = Pick<KeyProperties, 'method'>;
export type KeyConstructorProperties = KeyOptionalConstructorProperties & KeyRequiredConstructorProperties;

export class Key implements KeyProperties {
    public method: string;
    public uri: string;
    public iv: Buffer;
    public format: string;
    public formatVersion: string;
    constructor({
        method, // required
        uri, // required unless method=NONE
        iv,
        format,
        formatVersion,
    }: KeyConstructorProperties) {
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

export interface MediaInitializationSectionProperties {
    hint: boolean;
    uri: string;
    mimeType: string;
    byterange: ByteRange;
}

export type MediaInitializationSectionOptionalConstructorProperties = Partial<
    Pick<MediaInitializationSectionProperties, 'hint' | 'mimeType' | 'byterange'>
>;
export type MediaInitializationSectionRequiredConstructorProperties = Pick<MediaInitializationSectionProperties, 'uri'>;
export type MediaInitializationSectionConstructorProperties = MediaInitializationSectionOptionalConstructorProperties &
    MediaInitializationSectionRequiredConstructorProperties;

export class MediaInitializationSection implements MediaInitializationSectionProperties {
    public hint: boolean;
    public uri: any;
    public mimeType: any;
    public byterange: ByteRange;
    constructor({
        hint = false,
        uri, // required
        mimeType,
        byterange,
    }: MediaInitializationSectionConstructorProperties) {
        utils.PARAMCHECK(uri);
        this.hint = hint;
        this.uri = uri;
        this.mimeType = mimeType;
        this.byterange = byterange;
    }
}

export interface DateRangeProperties {
    id: string;
    classId: string;
    start: string;
    end: string;
    duration: number;
    plannedDuration: number;
    endOnNext: boolean;
    attributes: Record<string, any>;
}

export type DateRangeOptionalConstructorProperties = Partial<
    Pick<DateRangeProperties, 'start' | 'end' | 'duration' | 'plannedDuration' | 'endOnNext' | 'attributes'>
>;
export type DateRangeRequiredConstructorProperties = Pick<DateRangeProperties, 'id' | 'classId'>;
export type DateRangeConstructorProperties = DateRangeOptionalConstructorProperties &
    DateRangeRequiredConstructorProperties;

export class DateRange implements DateRangeProperties {
    public id: string;
    public classId: string;
    public start: string;
    public end: string;
    public duration: number;
    public plannedDuration: number;
    public endOnNext: boolean;
    public attributes: Record<string, any>;

    constructor({
        id, // required
        classId, // required if endOnNext is true
        start,
        end,
        duration,
        plannedDuration,
        endOnNext,
        attributes = {},
    }: DateRangeConstructorProperties) {
        utils.PARAMCHECK(id);
        utils.CONDITIONALPARAMCHECK([endOnNext === true, classId]);
        utils.CONDITIONALASSERT(
            [end, start],
            [end, start <= end],
            [duration, duration >= 0],
            [plannedDuration, plannedDuration >= 0],
        );
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

export type SpliceTypes = 'OUT' | 'IN' | 'RAW';
export type SpliceTagNames =
    | 'EXT-X-CUE-OUT-CONT'
    | 'EXT-X-CUE-OUT-CONT'
    | 'EXT-OATCLS-SCTE35'
    | 'EXT-X-ASSET'
    | 'EXT-X-SCTE35';
export interface SpliceInfoProperties {
    type: SpliceTypes;
    duration: number;
    tagName: SpliceTagNames;
    value: string;
}

export type SpliceInfoOptionsalConstructorProperties = Partial<
    Pick<SpliceInfoProperties, 'duration' | 'tagName' | 'value'>
>;
export type SpliceInfoRequiredConstructorProperties = Pick<SpliceInfoProperties, 'type'>;
export type SpliceInfoConstructorProperties = SpliceInfoOptionsalConstructorProperties &
    SpliceInfoRequiredConstructorProperties;

export class SpliceInfo implements SpliceInfoProperties {
    public type: SpliceTypes;
    public duration: number;
    public tagName: SpliceTagNames;
    public value: string;

    constructor({
        type, // required
        duration, // required if the type is 'OUT'
        tagName, // required if the type is 'RAW'
        value,
    }: SpliceInfoConstructorProperties) {
        utils.PARAMCHECK(type);
        utils.CONDITIONALPARAMCHECK([type === 'OUT', duration]);
        utils.CONDITIONALPARAMCHECK([type === 'RAW', tagName]);
        this.type = type;
        this.duration = duration;
        this.tagName = tagName;
        this.value = value;
    }
}

export class Data {
    public type: string;
    constructor(type: string) {
        utils.PARAMCHECK(type);
        this.type = type;
    }
}

export interface PlaylistStart {
    offset: number;
    precise: boolean;
}

export interface PlaylistProperties extends Data {
    isMasterPlaylist: boolean;
    uri: string;
    version: number;
    independentSegments: boolean;
    start: PlaylistStart;
    source: string;
}

export type PlaylistOptionalConstructorProperties = Partial<
    Pick<PlaylistProperties, 'uri' | 'version' | 'independentSegments' | 'start' | 'source'>
>;
export type PlaylistRequiredConstructorProperties = Pick<PlaylistProperties, 'isMasterPlaylist'>;
export type PlaylistConstructorProperties = PlaylistOptionalConstructorProperties &
    PlaylistRequiredConstructorProperties;

export class Playlist extends Data implements PlaylistProperties {
    public isMasterPlaylist: boolean;
    public uri: string;
    public version: number;
    public independentSegments: boolean;
    public start: PlaylistStart;
    public source: string;

    constructor({
        isMasterPlaylist, // required
        uri,
        version,
        independentSegments = false,
        start,
        source,
    }: PlaylistConstructorProperties) {
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

export interface MasterPlaylistProperties extends PlaylistProperties {
    variants: Variant[];
    currentVariant: Variant;
    sessionDataList: SessionData[];
    sessionKeyList: Key[];
}
export type MasterPlaylistOptionalConstructorProperties = Partial<
    Pick<MasterPlaylistProperties, 'variants' | 'currentVariant' | 'sessionDataList' | 'sessionKeyList'>
>;
export type MasterPlaylistConstructorProperties = Omit<PlaylistConstructorProperties, 'isMasterPlaylist'> &
    MasterPlaylistOptionalConstructorProperties;

export class MasterPlaylist extends Playlist implements MasterPlaylistProperties {
    public variants: Variant[];
    public currentVariant: Variant;
    public sessionDataList: SessionData[];
    public sessionKeyList: Key[];

    constructor(params: MasterPlaylistConstructorProperties = {}) {
        (params as PlaylistConstructorProperties).isMasterPlaylist = true;
        super(params as PlaylistConstructorProperties);
        const { variants = [], currentVariant, sessionDataList = [], sessionKeyList = [] } = params;
        this.variants = variants;
        this.currentVariant = currentVariant;
        this.sessionDataList = sessionDataList;
        this.sessionKeyList = sessionKeyList;
    }
}

export interface MediaPlaylistProperties extends PlaylistProperties {
    targetDuration: number;
    mediaSequenceBase: number;
    discontinuitySequenceBase: number;
    endlist: boolean;
    playlistType: string;
    isIFrame: boolean;
    segments: Segment[];
    prefetchSegments: PrefetchSegment[];
    lowLatencyCompatibility: LowLatencyCompatibility;
    partTargetDuration: number;
    renditionReports: RenditionReport[];
    skip: number;
    hash: string;
}

export type MediaPlaylistOptionalConstructorProperties = Partial<
    Pick<
        MediaPlaylistProperties,
        | 'mediaSequenceBase'
        | 'discontinuitySequenceBase'
        | 'endlist'
        | 'segments'
        | 'prefetchSegments'
        | 'renditionReports'
        | 'skip'
        | 'targetDuration'
        | 'playlistType'
        | 'isIFrame'
        | 'lowLatencyCompatibility'
        | 'partTargetDuration'
        | 'hash'
    >
>;
export type MediaPlaylistConstructorProperties = Omit<PlaylistConstructorProperties, 'isMasterPlaylist'> &
    MediaPlaylistOptionalConstructorProperties;

export class MediaPlaylist extends Playlist implements MediaPlaylistProperties {
    public targetDuration: number;
    public mediaSequenceBase: number;
    public discontinuitySequenceBase: number;
    public endlist: boolean;
    public playlistType: string;
    public isIFrame: boolean;
    public segments: Segment[];
    public prefetchSegments: PrefetchSegment[];
    public lowLatencyCompatibility: LowLatencyCompatibility;
    public partTargetDuration: number;
    public renditionReports: RenditionReport[];
    public skip: number;
    public hash: string;

    constructor(params: MediaPlaylistConstructorProperties = {}) {
        (params as PlaylistConstructorProperties).isMasterPlaylist = false;
        super(params as PlaylistConstructorProperties);
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
            hash,
        } = params;
        this.targetDuration = targetDuration;
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

export interface SegmentProperties extends Data {
    uri: string;
    mimeType: string;
    data: string;
    duration: number;
    title: string;
    byterange: ByteRange;
    discontinuity: boolean;
    mediaSequenceNumber: number;
    discontinuitySequence: number;
    key: Key;
    map: MediaInitializationSection;
    programDateTime: Date;
    dateRange: DateRange;
    markers: SpliceInfo[];
    parts: PartialSegment[];
}

export type SegmentOptionalConstructorProperties = Partial<
    Pick<
        SegmentProperties,
        | 'mediaSequenceNumber'
        | 'discontinuitySequence'
        | 'markers'
        | 'parts'
        | 'uri'
        | 'mimeType'
        | 'data'
        | 'title'
        | 'byterange'
        | 'discontinuity'
        | 'key'
        | 'map'
        | 'programDateTime'
        | 'dateRange'
        | 'duration'
    >
>;
export type SegmentConstructorProperties = SegmentOptionalConstructorProperties;

export class Segment extends Data implements SegmentProperties {
    public uri: string;
    public mimeType: string;
    public data: string;
    public duration: number;
    public title: string;
    public byterange: ByteRange;
    public discontinuity: boolean;
    public mediaSequenceNumber: number;
    public discontinuitySequence: number;
    public key: Key;
    public map: MediaInitializationSection;
    public programDateTime: Date;
    public dateRange: DateRange;
    public markers: SpliceInfo[];
    public parts: PartialSegment[];

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
        parts = [],
    }: SegmentConstructorProperties) {
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

export interface PartialSegmentProperties extends Data {
    hint: boolean;
    uri: string;
    duration: number;
    independent: boolean;
    byterange: string;
    gap: string;
}

export type PartialSegmentsOptionalConstructorProperties = Partial<
    Pick<PartialSegmentProperties, 'hint' | 'duration' | 'independent' | 'byterange' | 'gap'>
>;
export type PartialSegmentsRequiredConstructorProperties = Pick<PartialSegmentProperties, 'uri'>;
export type PartialSegmentConstructorProperties = PartialSegmentsOptionalConstructorProperties &
    PartialSegmentsRequiredConstructorProperties;

export class PartialSegment extends Data implements PartialSegmentProperties {
    public hint: boolean;
    public uri: string;
    public duration: number;
    public independent: boolean;
    public byterange: string;
    public gap: string;

    constructor({
        hint = false,
        uri, // required
        duration,
        independent,
        byterange,
        gap,
    }: PartialSegmentConstructorProperties) {
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

export interface PrefetchSegmentProperties extends Data {
    uri: string;
    discontinuity: boolean;
    mediaSequenceNumber: number;
    discontinuitySequence: number;
    key: Key;
}

export type PrefetchSegmentOptionalConstructorProperties = Partial<
    Pick<PrefetchSegmentProperties, 'discontinuity' | 'mediaSequenceNumber' | 'discontinuitySequence' | 'key'>
>;
export type PrefetchSegmentRequiredConstructorProperties = Pick<PrefetchSegmentProperties, 'uri'>;
export type PrefetchSegmentConstructorProperties = PrefetchSegmentOptionalConstructorProperties &
    PrefetchSegmentRequiredConstructorProperties;

export class PrefetchSegment extends Data implements PrefetchSegmentProperties {
    public uri: string;
    public discontinuity: boolean;
    public mediaSequenceNumber: number;
    public discontinuitySequence: number;
    public key: Key;

    constructor({
        uri, // required
        discontinuity,
        mediaSequenceNumber = 0,
        discontinuitySequence = 0,
        key,
    }: PrefetchSegmentConstructorProperties) {
        super('prefetch');
        utils.PARAMCHECK(uri);
        this.uri = uri;
        this.discontinuity = discontinuity;
        this.mediaSequenceNumber = mediaSequenceNumber;
        this.discontinuitySequence = discontinuitySequence;
        this.key = key;
    }
}

export interface RenditionReportProperties {
    uri: string;
    lastMSN: string;
    lastPart: string;
}

export type RenditionReportOptionalConstructorProperties = Partial<
    Pick<RenditionReportProperties, 'lastMSN' | 'lastPart'>
>;
export type RenditionReportRequiredConstructorProperties = Pick<RenditionReportProperties, 'uri'>;

export class RenditionReport implements RenditionReportProperties {
    public uri: string;
    public lastMSN: string;
    public lastPart: string;

    constructor({
        uri, // required
        lastMSN,
        lastPart,
    }) {
        utils.PARAMCHECK(uri);
        this.uri = uri;
        this.lastMSN = lastMSN;
        this.lastPart = lastPart;
    }
}
