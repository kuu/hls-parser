const {URL} = require('url');
const {MasterPlaylist, SessionData} = require('../../../types');

const playlist = new MasterPlaylist({
  uri: new URL('http://node-hls-stream.com/8.8-Session-Data-in-a-Master-Playlist.m3u8'),
  sessionDataList: createSetssionDataList(),
});

function createSetssionDataList() {
  const setssionDataList = [];
  setssionDataList.push(new SessionData({
    id: 'com.example.lyrics',
    uri: new URL('http://node-hls-stream.com/lyrics.json')
  }));
  setssionDataList.push(new SessionData({
    id: 'com.example.title',
    language: 'en',
    value: 'This is an example'
  }));
  setssionDataList.push(new SessionData({
    id: 'com.example.title',
    language: 'es',
    value: 'Este es un ejemplo'
  }));
  return setssionDataList;
}

module.exports = playlist;
