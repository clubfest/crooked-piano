
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

  addTextToUserTrack: function(textType, text, note, userTrack) {
    var trackId = userTrack.trackId;
    var notes = userTrack.notes;
    var currentTime = note.startTimeInMicroseconds;

    var newNote = {
      type: 'meta',
      subtype: textType,
      text: text,
      startTimeInBeats: note.startTimeInBeats,
      startTimeInMicroseconds: note.startTimeInMicroseconds,
      startTimeInTicks: note.startTimeInTicks,
      trackId: trackId,
    };

    if (userTrack.notes.length === 0 
        || currentTime > userTrack.notes[userTrack.notes.length - 1].startTimeInMicroseconds) {
      UserTracks.update(userTrack._id, {
        $push: {notes: newNote}
      });
    }

    for (var i = 0; i < userTrack.notes.length; i++) {
      var existingNote = userTrack.notes[i];

      if (currentTime <= existingNote.startTimeInMicroseconds) {
        if (currentTime === existingNote.startTimeInMicroseconds) {
          existingNote.text = text;
        } else if (text.length > 0) {
          userTrack.notes.splice(i, 0, newNote);
        }

        UserTracks.update(userTrack._id, {
          $set: {notes: userTrack.notes}
        });

        break ;
      }
    }    
  },

  incrementViewCount: function(songId) {
    SongFiles.update(songId, {
      $inc: {viewCount: 1}
    });
  },
})