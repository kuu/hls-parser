const {URL} = require('url');
const {MediaPlaylist, Segment, DateRange} = require('../../../types');
const utils = require('../../../utils');

const playlist = new MediaPlaylist({
  uri: new URL('http://node-hls-stream.com/8.10-EXT-X-DATERANGE-carrying-SCTE-35-tags.m3u8'),
  targetDuration: 10,
  segments: createSegments()
});

function createSegments() {
  const segments = [];
  segments.push(new Segment({
    uri: new URL('http://media.example.com/01.ts'),
    duration: 10,
    title: '',
    mediaSequenceNumber: 0,
    discontinuitySequence: 0,
    programDateTime: new Date('2014-03-05T11:14:40Z')
  }));
  segments.push(new Segment({
    uri: new URL('http://media.example.com/02.ts'),
    duration: 10,
    title: '',
    mediaSequenceNumber: 1,
    discontinuitySequence: 1
  }));
  segments.push(new Segment({
    uri: new URL('http://ads.example.com/ad-01.ts'),
    duration: 10,
    title: '',
    mediaSequenceNumber: 2,
    discontinuitySequence: 2,
    dateRange: new DateRange({
      id: 'splice-6FFFFFF0',
      start: new Date('2014-03-05T11:15:00Z'),
      plannedDuration: 20,
      attributes: {
        'SCTE35-OUT': utils.hexToByteSequence('0xFC002F0000000000FF000014056FFFFFF000E011622DCAFF000052636200000000000A0008029896F50000008700000000')
      }
    })
  }));
  segments.push(new Segment({
    uri: new URL('http://ads.example.com/ad-02.ts'),
    duration: 10,
    title: '',
    mediaSequenceNumber: 3,
    discontinuitySequence: 3
  }));
  segments.push(new Segment({
    uri: new URL('http://media.example.com/03.ts'),
    duration: 10,
    title: '',
    mediaSequenceNumber: 4,
    discontinuitySequence: 4,
    dateRange: new DateRange({
      id: 'splice-6FFFFFF0',
      start: new Date('2014-03-05T11:15:00Z'),
      duration: 20,
      attributes: {
        'SCTE35-IN': utils.hexToByteSequence('0xFC002A0000000000FF00000F056FFFFFF000401162802E6100000000000A0008029896F50000008700000000')
      }
    })
  }));
  segments.push(new Segment({
    uri: new URL('http://media.example.com/04.ts'),
    duration: 3.003,
    title: '',
    mediaSequenceNumber: 5,
    discontinuitySequence: 5
  }));
  return segments;
}

module.exports = playlist;
