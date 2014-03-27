// TODO: define DiscardedSongs
// TODO: think about whether to add absoluteIndex to each relative segment. Problem: it will be hard to edit/update these absoluteIndex
// segments is an object with segmentId as the key and an object with notes as value
// segments are actually tracks. We will cut it up later.
// TODO: replace segment by track

Songs = new Meteor.Collection('songs');

Meteor.methods({
  createTranslatedSong: function(notes, segments, songInfo, channels, rawData) {
    var user = Meteor.user();

    if (!user) {
      // throw new Meteor.Error(413, 'User needs to sign in first.')
      user = {
        _id: null,
        username: null,
      }
    }

    if (notes.length < 1) {
      throw new Meteor.Error(413, 'The recording provided is empty.');
    }
    
    // store the list of segmentId for easy iteration later
    var segmentIds = [];

    for (var segmentId in segments) {
      segmentId = parseInt(segmentId);

      segmentIds.push(segmentId);

      // remove drum track from the song
      if (segments[segmentId].text && segments[segmentId].text.toLowerCase().indexOf('drum') > -1) {
        segments[segmentId].isRemoved = true;

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

    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];      

      // transfer the upload annotation of start and end to each segment
      if (note.isStart) {
        segments[note.segmentId].startIndex = i;

      } else if (note.isEnd) {
        segments[note.segmentId].endIndex = i;
      }

      // annotate keyCode
      var noteNumber = note.note;
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
      note.keyCode = keyCode;
    }

    // computing different stats for experimenting. TODO: use machine-learning
    for (var i = 0; i < segmentIds.length; i++) {
      var segmentId = segmentIds[i];
      var segment = segments[segmentId];

      // compute averageNote to see where the melody is. 
      var averageNote = 0;

      for (var j = 0; j < segment.notes.length; j++) {
        averageNote += segment.notes[j].note;
      }

      averageNote /= segment.notes.length;
      segment.averageNote = averageNote;

      // compute the averageJump
      var averageJump = 0;
      var prevNoteNumber = segment.notes[0].note;
      var totalCount = 0;

      for (var j = 1; j < segment.notes.length; j++) {
        var note = segment.notes[j];
        if (note.event === 'noteOn') {
          averageJump += Math.abs(segment.notes[j].note - prevNoteNumber);
          prevNoteNumber = segment.notes[j].note;
          totalCount++;
        }
      }

      averageJump /= totalCount;
      segment.averageJump = averageJump;

      // compute the wait time if longer than 10 seconds
      var waitTime = 0;
      var prevTime = 0;
      for (var j = 0; j < segment.notes.length; j++) {
        var currentTime = segment.notes[j].time;
        var timeDiff = currentTime - prevTime;
        prevTime = currentTime;
        if (timeDiff > 10000) {
          waitTime += timeDiff;
        }
      }

      var lastDiff = notes[notes.length - 1].time - prevTime;

      if (lastDiff > 20000) {
        waitTime += lastDiff;
      }
      
      segment.waitTime = waitTime / notes[notes.length - 1].time;
    }

    // TODO: if it is more than 2 hands, eliminate the ones with very few notes
    // TODO: simplify the sort to just be how high the notes are
    segmentIds.sort(function(a, b) {
      var segmentA = segments[a];
      var segmentB = segments[b];
      var bIsBigger = (segmentB.averageNote - segmentA.averageNote);

      return bIsBigger;
    });

    var melodicSegmentId;

    for (var i = 0; i < segmentIds.length; i++) {
      var segmentId = segmentIds[i];
      var segment = segments[segmentId];

      if (segment.text && segment.text.match(/melody/i)) {
        melodicSegmentId = segmentId;
        break;
      }
    }

    if (!melodicSegmentId) {
      for (var i = 0; i < segmentIds.length; i++) {
        var segmentId = segmentIds[i];
        var segment = segments[segmentId];

        if (segment.text && segment.text.match(/vocal/i)) {
          melodicSegmentId = segmentId;
          break;
        }
      }
    }

    var possibleMelodies = [];
    if (!melodicSegmentId) {
      for (var i = 0; i < segmentIds.length; i++) {
        var segmentId = segmentIds[i];
        var segment = segments[segmentId];
        if (segment.waitTime < 0.35) {
          var firstNote = segment.notes[0];

          if (firstNote && firstNote.time < 30000) {
            melodicSegmentId = segmentId;
            break;
          }
        }
      }
    }

    mainTrack = parseInt(melodicSegmentId);
    console.log(channels)

    var song = {
      title: '',
      desc: '',
      artist: '',
      songInfo: songInfo,
      notes: notes,
      previewNotes: notes.slice(0, 100),
      segments: segments,
      segmentIds: segmentIds,
      mainTrack: mainTrack,
      shift: 0, // todo: calculate smartly
      createdAt: new Date(),
      createdBy: user.username,
      creatorId: user._id,
      playCount: 0,
      speed: 1,
      channels: channels,
      // rawData: rawData, // TODO: include this when we are ready
    };

    // saving
    var songId = Songs.insert(song);
    console.log(songId)
    return songId;
  },


  removeSong: function(songId) {
    Songs.remove(songId);
  },

  gamify: function(songId, mainTrack, shift, speed) {
    var song = Songs.findOne(songId);
    var notes = song.notes;

    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    if (!mainTrack) { mainTrack = song.mainTrack; }
    if (!shift) { shift = song.shift; }
    if (!speed) { speed = song.speed; }
    
    // annotate
    // for (var i = 0; i < notes.length; i ++) {
    //   notes[i].note += shift;

    //   var noteNumber = notes[i].note;
    //   var keyCode = noteToKeyCode[noteNumber];

    //   if (!keyCode) {
    //     while (noteNumber > 84) {
    //       noteNumber -= 12;
    //     } 
    //     while (noteNumber < 47) {
    //       noteNumber += 12;
    //     }

    //     keyCode = noteToKeyCode[noteNumber];
    //   }
    //   notes[i].keyCode = keyCode;
    // } 
    
    Songs.update(songId, {
      $set: {
        isGamified: true,
        // notes: notes,
        // previewNotes: notes.slice(0, 100),
        mainTrack: mainTrack,
        shift: shift,
        speed: speed,
      }
    });
  },

  removeTrack: function(songId, segmentId) {
    var song = Songs.findOne(songId);
    var newInfo = {};
    var newNotes = [];

    for (var i = 0; i < song.notes.length; i++) {
      var note = song.notes[i];
      if (note.segmentId !== segmentId) {
        newNotes.push(note);
      }
    }

    newInfo.notes = newNotes;
    newInfo.previewNotes = newInfo.notes.slice(0, 100);
    newInfo['segments.' + segmentId + '.isRemoved'] = true;

    Songs.update(songId, {
      $set: newInfo,
    });

    return newInfo.notes;
  },

  unremoveTrack: function(songId, segmentId) {
    // throw new Meteor.Error(413, 'Not possible currently.')
    var song = Songs.findOne(songId);
    var newInfo = {};

    newInfo.notes = Mixer.mergeSortTwo(song.notes, song.segments[segmentId].notes);
    newInfo.previewNotes = newInfo.notes.slice(0, 100);
    newInfo['segments.' + segmentId + '.isRemoved'] = false;

    Songs.update(songId, {
      $set: newInfo,
    });

    return newInfo.notes;
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

