
SongForks = new Meteor.Collection('songForks');

Meteor.methods({
  createSongFork: function(songId) {
    return SongForks.insert({songId: songId});
  },

  forkLyrics: function(text, note, forkId, songId) {
    if (!forkId) {
      var forkId = SongForks.insert({songId: songId})
    }
    var song = SongFiles.findOne(songId);
    SongForks.update(forkId, {
      $push: {
        diffs: {
          type: 'addNote',
          value: {
            type: 'meta',
            subtype: 'lyrics',
            text: text,
            id: song.idIndex++,
            deltaTime: 0,
            startTimeInBeats: note.startTimeInBeats,
            startTimeInMicroseconds: note.startTimeInMicroseconds,
            trackId: note.trackId,
          }
        }
      }
    });
    return forkId;
  },
})
