// TODO: define DiscardedSongs
// TODO: think about whether to add absoluteIndex to each relative segment. Problem: it will be hard to edit/update these absoluteIndex
// segments is an object with segmentId as the key and an object with notes as value
// segments are actually tracks. We will cut it up later.
// TODO: replace segment by track

Songs = new Meteor.Collection('songs');

Meteor.methods({
  createTranslatedSong: function(notes, notesByTrack, songInfo) {
    var user = Meteor.user();

    if (!user) {
      throw new Meteor.Error(413, 'User needs to sign in first.')
    }

    if (notes.length < 1) {
      throw new Meteor.Error(413, 'The recording provided is empty.');
    }
    
    // store the list of segmentId for easy iteration later
    var segmentIds = [];

    for (var segmentId in notesByTrack) {
      segmentId = parseInt(segmentId);

      segmentIds.push(segmentId);

      // remove drum track from the song
      if (notesByTrack[segmentId].text && notesByTrack[segmentId].text.toLowerCase().indexOf('drums') > -1) {
        notesByTrack[segmentId].isRemoved = true;

        var newNotes = [];
        for (var i = 0; i < notes.length; i++) {
          var note = notes[i];
          if (note.segmentId !== segmentId) { 
            newNotes.push(note);
          }
        }
        notes = newNotes;
      }
    }

    // transfer the upload annotation of start and end to each segment
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];      

      if (note.isStart) {
        notesByTrack[note.segmentId].startIndex = i;

      } else if (note.isEnd) {
        notesByTrack[note.segmentId].endIndex = i;
      }
    }

    // compute averageNote to see where the melody is; not 100% foolproof
    // TODO: use machine-learning
    for (var i = 0; i < segmentIds.length; i++) {
      var segmentId = segmentIds[i];
      var segment = notesByTrack[segmentId];

      var averageNote = 0;

      for (var j = 0; j < segment.notes.length; j++) {
        averageNote += segment.notes[j].note;
      }

      averageNote /= segment.notes.length;

      segment.averageNote = averageNote;
    }

    segmentIds.sort(function(a, b) {
      var segmentA = notesByTrack[a];
      var segmentB = notesByTrack[b];

      var bIsBigger = (segmentB.averageNote - segmentA.averageNote);

      if (segmentA.startIndex > 400 && segmentB.startIndex < 400) {
        bIsBigger += 100;
      }

      if (segmentA.isRemoved && !segmentB.isRemoved) {
        bIsBigger += 200;
      }

      return bIsBigger;
    });

    mainTrack = parseInt(segmentIds[0]);

    // saving
    var songId = Songs.insert({
      title: '',
      desc: '',
      artist: '',
      songInfo: songInfo,
      notes: notes,
      segments: notesByTrack,
      segmentIds: segmentIds,
      mainTrack: mainTrack,
      shift: 0, // todo: calculate smartly
      createdAt: new Date(),
      createdBy: user.username,
      creatorId: user._id,
      playCount: 0,
    });

    return songId;
  },


  removeSong: function(songId) {
    Songs.remove(songId);
  },

  incrementPlayCount: function(songId) {
    var song = Songs.findOne(songId, {fields: {playCount: 1}});
    Songs.update(songId, {
      $set: {playCount: song.playCount + 1}
    });
  },


  gamify: function(songId) {
    // var newInfo = {};

    var song = Songs.findOne(songId);

    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    var notes = song.notes;
    // todo: annotate the keys according to the shift
    // annotate
    for (var i = 0; i < notes.length; i ++) {
      var noteNumber = notes[i].note;
      var keyCode = noteToKeyCode[noteNumber];

      if (!keyCode) {
        while (noteNumber > 84) {
          noteNumber -= 12;
        } 
        while (noteNumber < 47) {
          noteNumber += 12;
        }

        keyCode = noteToKeyCode[noteNumber];
      }

      notes[i].keyCode = keyCode;

      // Note that I will not update the note
      // this.notes[i].note = noteNumber;
    } 
    
    Songs.update(songId, {
      $set: {
        // mainTrack: mainTrack,
        // segments: song.segments,
        // segmentIds: song.segmentIds,
        isGamified: true,
        notes: notes,
        previewNotes: notes.slice(0, 100),
      }
    });
  },

  removeTrack: function(songId, segmentId) {
    var newInfo = {};
    newInfo['segments.' + segmentId + '.isRemoved'] = true;

    var song = Songs.findOne(songId);
    var newNotes = []
    for (var i = 0; i < song.notes.length; i++) {
      var note = song.notes[i];
      if (note.segmentId !== segmentId) {
        newNotes.push(note);
      }
    }


    newInfo.notes = newNotes;

    Songs.update(songId, {
      $set: newInfo,
    });
  },

  unremoveTrack: function(songId, segmentId) {
    // throw new Meteor.Error(413, 'Not possible currently.')
    song = Songs.findOne(songId);
    var newInfo = {};

    newInfo.notes = Mixer.mergeSortTwo(song.notes, song.segments[segmentId].notes);

    newInfo['segments.' + segmentId + '.isRemoved'] = false;
    Songs.update(songId, {
      $set: newInfo,
    });
  },

  updateSongDesc: function(songId, desc) {
    var song = Songs.findOne(songId, {creatorId: 1})
    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }
    Songs.update(songId, {
      $set: {desc: desc}
    });
  },
  
  updateSongTitle: function(songId, title) {
    var song = Songs.findOne(songId, {creatorId: 1})
    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    Songs.update(songId, {
      $set: {title: title}
    });
  },

  updateSongArtist: function(songId, artist) {
    var song = Songs.findOne(songId, {creatorId: 1})
    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    Songs.update(songId, {
      $set: {artist: artist}
    });
  },

  updateSongYoutubeLink: function(songId, youtubeLink) {
    var song = Songs.findOne(songId, {creatorId: 1})
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
      Songs.update(songId, {
        $set: {
          youtubeLink: youtubeLink,
          youtubeId: youtubeId
        }
      });
    }
  },

  updateSongMainTrack: function(songId, mainTrack) {
    var song = Songs.findOne(songId, {creatorId: 1})
    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    Songs.update(songId, {
      $set: {mainTrack: mainTrack}
    });
  },

  updateSongShift: function(songId, shift) {
    var song = Songs.findOne(songId, {creatorId: 1})
    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    Songs.update(songId, {
      $set: {shift: shift}
    });
  },
});

