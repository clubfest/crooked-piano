
SongFiles = new Meteor.Collection('songFiles');
// user created
UserTracks = new Meteor.Collection('userTracks');

Meteor.methods({
  'createSongFile': function(hash) {
    var songId = SongFiles.insert(hash);
    return songId;
  },

  findOrCreateUserTrack: function(songId, trackType, name) {
    var userTrack = UserTracks.findOne({
      userId: 'anonymous',
      name: name,
      songId: songId
    });

    if (userTrack) {
      userTrackId = userTrack._id;
    } else {
      var song = SongFiles.findOne(songId);

      var userTrackId = UserTracks.insert({
        userId: 'anonymous',
        name: name,
        songId: songId,
        trackId: song.trackIndex,
        trackType: trackType,
        notes: [],
      });

      SongFiles.update(songId, {
        $set: {trackIndex: song.trackIndex + 1}
      });
    }

    return userTrackId;
  },

  addTextToUserTrack: function(textType, text, note, index, userTrack) {
    var trackId = userTrack.trackId;
    var notes = userTrack.notes;

    if (index >= notes.length) {
      if (text.length > 0) {
        var textNote = {
          type: 'meta',
          subtype: textType,
          text: text,
          startTimeInBeats: note.startTimeInBeats,
          startTimeInMicroseconds: note.startTimeInMicroseconds,
          trackId: trackId,
        }

        UserTracks.update(userTrack._id, {
          $push: {notes: textNote}
        });

        // notes.push(textNote);
      }

    } else {
      if (text.length === 0) {
        notes.splice(index, 1);

      } else {
        console.log(notes.length);
        console.log(index);
        var note = notes[index];
        note.text = text;
      }

      UserTracks.update(userTrack._id, {
        $set: {notes: notes}
      });
    }

    // return notes;
  },

  incrementViewCount: function(songId) {
    SongFiles.update(songId, {
      $inc: {viewCount: 1}
    });
  },
})