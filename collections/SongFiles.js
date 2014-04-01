// songFile contains all the tracks and notes
SongFiles = new Meteor.Collection('songFiles');

Meteor.methods({
  createSongFile: function(hash) {
    var user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(413, 'Need to sign in before creating a song');
    }

    hash.public = false;
    hash.creatorId = user._id;
    hash.createdAt = new Date;

    var songId = SongFiles.insert(hash);
    return songId;
  },

  gamify: function(songId, trackId) {
    var user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(413, 'Need to sign in before creating a song');
    }

    SongFiles.update(songId, {
      $set: {
        public: true,
        melodicTrackId: trackId,
      }
    });
  },

  createTrack: function(songId, trackName) {
    var user = Meteor.user();

    if (!user) {
      throw new Meteor.Error(413, 'User needs to sign in first.');
    }

    var song = SongFiles.findOne(songId); // TODO: optimize
    var trackId = song.trackIndex;

    var update = { trackIndex: song.trackIndex + 1 };

    update['userTracks.' + trackId] = {
      notes: [], 
      createdAt: new Date(), 
      creatorId: user._id,
      creatorName: 'anonymous',
      trackId: trackId,
      trackName: 'trackName',
    };

    SongFiles.update(songId, {
      $set: update,
    });

    return trackId;
  },

  addTextToUserTrack: function(textType, text, note, userTrack, songId) {
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

      pushToUserTrackNotes(newNote, trackId, songId);
    }

    for (var i = 0; i < userTrack.notes.length; i++) {
      var existingNote = userTrack.notes[i];

      if (currentTime <= existingNote.startTimeInMicroseconds) {
        if (currentTime === existingNote.startTimeInMicroseconds) {
          existingNote.text = text;
        } else if (text.length > 0) {
          userTrack.notes.splice(i, 0, newNote);
        }

        setUserTrackNotes(userTrack.notes);
        break ;
      }
    }    
  },

  incrementViewCount: function(songId) {
    SongFiles.update(songId, {
      $inc: {viewCount: 1}
    });
  },

  updateSongDesc: function(songId, desc) {
    var song = SongFiles.findOne(songId, {creatorId: 1})
    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }
    SongFiles.update(songId, {
      $set: {desc: desc}
    });
  },
  
  updateSongTitle: function(songId, title) {
    var song = SongFiles.findOne(songId, {creatorId: 1})
    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    SongFiles.update(songId, {
      $set: {title: title}
    });
  },

  updateSongArtist: function(songId, artist) {
    var song = SongFiles.findOne(songId, {creatorId: 1})
    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    SongFiles.update(songId, {
      $set: {artist: artist}
    });
  },

  updateSongYoutubeLink: function(songId, youtubeLink) {
    var song = SongFiles.findOne(songId, {creatorId: 1})
    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    if (Meteor.isServer) {
      if (youtubeLink.toLowerCase().indexOf('http') != 0) {
        youtubeLink = 'http://' + youtubeLink;
      }

      var url = Npm.require('url');
      var result = url.parse(youtubeLink, true);
      // console.log(result)
      if (result.hostname.toLowerCase().indexOf('youtube.com') > -1 && result.query.v) {
        var youtubeId = result.query.v;
      } else if (result.hostname.toLowerCase().indexOf('youtu.be') > -1 && result.pathname.length > 0) {
        var youtubeId = result.pathname.substring(1);
      } else {
        throw new Meteor.Error(413, 'Please provide a valid youtube link');        
      }
      
      SongFiles.update(songId, {
        $set: {
          youtubeLink: youtubeLink,
          youtubeId: youtubeId
        }
      });
    }
  },
});

function pushToUserTrackNotes(note, trackId, songId) {
  var userId = Meteor.userId();

  var song = SongFiles.findOne(songId); // TODO: optimize
  var userTrack = song.userTracks[trackId];

  if (userTrack.creatorId !== userId) {
    throw new Meteor.Error(413, "You are not signed in as the track's creator.");
  }

  var update = {};
  update['userTracks.' + trackId + '.notes'] = note;

  SongFiles.update(songId, {
    $push: update,
  });
}

function setUserTrackNotes(notes, trackId, songId) {
  var userId = Meteor.userId();

  var song = SongFiles.findOne(songId); // TODO: optimize
  var userTrack = song.userTracks[trackId];

  if (userTrack.creatorId !== userId) {
    throw new Meteor.Error(413, "You are not signed in as the track's creator.");
  }

  var update = {};
  update['userTracks.' + trackId + '.notes'] = notes;

  SongFiles.update(songId, {
    $set: update,
  });
}