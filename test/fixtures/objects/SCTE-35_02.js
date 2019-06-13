const {MediaPlaylist, Segment} = require('../../../types');

const playlist = new MediaPlaylist({
  playlistType: 'VOD',
  version: 3,
  targetDuration: 8,
  segments: createSegments(),
  endlist: true
});

function createSegments() {
  const segments = [];
  segments.push(new Segment({
    uri: '1.ts',
    duration: 8.008,
    title: '',
    mediaSequenceNumber: 0,
    discontinuitySequence: 0
  }));
  segments.push(new Segment({
    uri: '2.ts',
    duration: 8,
    title: '',
    mediaSequenceNumber: 1,
    discontinuitySequence: 0,
    markers: [{
      type: 'OUT',
      duration: 23.0
    }]
  }));
  segments.push(new Segment({
    uri: '3.ts',
    duration: 8,
    title: '',
    mediaSequenceNumber: 2,
    discontinuitySequence: 0,
    markers: [{
      type: 'RAW',
      tagName: 'EXT-X-CUE-OUT-CONT',
      value: 'ElapsedTime=8,Duration=23'
    }]
  }));
  segments.push(new Segment({
    uri: '4.ts',
    duration: 7,
    title: '',
    mediaSequenceNumber: 3,
    discontinuitySequence: 0,
    markers: [{
      type: 'RAW',
      tagName: 'EXT-X-CUE-OUT-CONT',
      value: 'ElapsedTime=16,Duration=23'
    }]
  }));
  segments.push(new Segment({
    uri: '5.ts',
    duration: 8.008,
    title: '',
    mediaSequenceNumber: 4,
    discontinuitySequence: 0,
    markers: [{
      type: 'IN'
    }]
  }));
  return segments;
}

module.exports = playlist;
