
SongFiles = new Meteor.Collection('songFiles');

Meteor.methods({
  'createSongFile': function(hash) {
    var songId = SongFiles.insert(hash);
    return songId;
  },

  // TODO: do it in bulk later
  insertLyrics: function(songId, text, note) {
    // update song.notes
    var song = SongFiles.findOne(songId);
    for (var i = 0; i < song.notes.length; i++) {
      var songNote = song.notes[i];
      if (note.id === songNote.id) {
        // insert after songNote, so that deltaTime is 0
        song.notes.splice(i + 1, 0, {
          type: 'meta',
          subtype: 'lyrics',
          text: text,
          id: song.idIndex++,
          deltaTime: 0,
          startTimeInBeats: songNote.startTimeInBeats,
          startTimeInMicroseconds: songNote.startTimeInBeats,
          trackId: songNote.trackId,
        });    
        console.log({
          type: 'meta',
          subtype: 'lyrics',
          text: text,
          id: song.idIndex++,
          deltaTime: 0,
          startTimeInBeats: songNote.startTimeInBeats,
          startTimeInMicroseconds: songNote.startTimeInBeats,
          trackId: songNote.trackId,
        })
        // SongFiles.update(songId, {
        //   $set: {
        //     notes: song.notes,
        //     idIndex: song.idIndex,
        //   }
        // });
        break ;
      }
    }
  },
})