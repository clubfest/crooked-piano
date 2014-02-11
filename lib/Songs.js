// TODO: define DiscardedSongs
// TODO: think about whether to add absoluteIndex to each relative segment. Problem: it will be hard to edit/update these absoluteIndex
// segments is an object with segmentId as the key and an object with notes as value
// segments are actually tracks. We will cut it up later.
// TODO: replace segment by track

Songs = new Meteor.Collection('songs');

Meteor.methods({
  createTranslatedSong: function(notes, notesByTrack) {
    var user = Meteor.user();

    if (!user) {
      throw new Meteor.Error(413, 'User needs to sign in first.')
    }

    if (notes.length < 1) {
      throw new Meteor.Error(413, 'The recording provided is empty.');
    }
    
    var segmentIds = [];

    for (var segmentId in notesByTrack) {
      segmentIds.push({segmentId: segmentId});
    }

    // saving
    var songId = Songs.insert({
      title: 'Title',
      desc: 'Description',
      notes: notes,
      // TODO: add these things back
      // monotromeFrequency: monotromeFrequency,
      // monotromeTime: monotromeTime,
      // notesByTrack: notesByTrack,
      segments: notesByTrack,
      segmentIds: segmentIds,
      createdAt: new Date(),
      createdBy: user.username,
      creatorId: user._id,
    });

    return songId;
  },

  createSong: function(notes, monotromeFrequency, monotromeTime) {
    var user = Meteor.user();

    if (!user) {
      throw new Meteor.Error(413, 'User needs to sign in first.')
    }

    if (notes.length < 1) {
      throw new Meteor.Error(413, 'The recording provided is empty.');
    }
    
    // annotation
    var segmentId = (new Date).getTime();

    for (var i = 0; i < notes.length; i++) {
      notes[i].segmentId = segmentId;
    }

    notes[0].isStart = true;
    notes[notes.length - 1].isEnd = true;

    var segments = {};
    segments[segmentId] = {notes: notes};

    // saving
    var songId = Songs.insert({
      title: 'Title',
      desc: 'Description',
      notes: notes,
      monotromeFrequency: monotromeFrequency,
      monotromeTime: monotromeTime,
      segments: segments,
      segmentIds: [{segmentId: segmentId}], // TODO: remove this
      createdAt: new Date(),
      createdBy: user.username,
      creatorId: user._id,
    });

    return songId;
  },

  removeSong: function(songId) {
    Songs.remove(songId);
  },

  addSegmentToSong: function(newNotes, songId) {
    var song = Songs.findOne(songId, {notes: 1, isGamified: 1, creatorId: 1})
    var userId = Meteor.userId();

    if (!userId) {
      throw new Meteor.Error(413, 'User needs to sign in first.');
    }

    if (userId !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    var segmentId = newNotes[0].segmentId;
    newNotes[0].isStart = true;
    newNotes[newNotes.length - 1].isEnd = true;

    var notes = song.notes;
    notes = Mixer.mergeSortTwo(notes, newNotes);

    var updates = {notes: notes};
    updates.segments = {};
    updates.segments[segmentId] = {notes: newNotes};

    Songs.update(songId, {
      $push: {
        segmentIds: segmentId, // TODO: remove this
        // segments: {segmentId: segmentId, notes: newNotes},
      }, 
      $set: updates,
    });

    if (song.isGamified) {
      // regamify
      Meteor.call('gamify', songId);
    }
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


  gamify: function(songId, genre) {
    var song = Songs.findOne(songId);

    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    for (var i = 0; i < song.notes.length; i++) {
      var note = song.notes[i];      

      if (note.isStart) {
        song.segments[note.segmentId].startIndex = i;

      } else if (note.isEnd) {
        song.segments[note.segmentId].endIndex = i;
      }
    }

    // compute averageNote
    for (var i = 0; i < song.segmentIds.length; i++) {
      var segmentInfo = song.segmentIds[i];

      // for legacy
      // if (typeof segmentInfo !== "object") {
      //   song.segmentIds[i] = {segmentId: segmentInfo}
      //   segmentInfo = song.segmentIds[i];
      // }

      var notes = song.segments[segmentInfo.segmentId].notes;
      segmentInfo.averageNote = 0;

      for (var j = 0; j < notes.length; j++) {
        segmentInfo.averageNote += notes[j].note;
      }

      segmentInfo.averageNote /= notes.length;
    }

    song.segmentIds.sort(function(a, b) {
      var bIsBigger = (b.averageNote - a.averageNote);
      if (song.segments[b.segmentId].startIndex - song.segments[a.segmentId].startIndex > 400) {
        bIsBigger -= 100;
      }

      return bIsBigger;
    });

    // compute breaks
    // var GOOD_LENGTH = 100;
    // for (var segmentId in song.segments) {
    //   var segment = song.segments[segmentId];
    //   var numPauses = Math.floor(segment.notes.length / GOOD_LENGTH);
    //   var pauses = [];

    //   for (var i = 0; i < segment.notes.length - 1; i++) {
    //     pauses.push({
    //       index: i,
    //       duration: segment.notes[i+1].time - segment.notes[i].time
    //     });
    //   }

    //   pauses.sort(function(a, b) {
    //     return b.duration - a.duration;
    //   });

    //   pauses = pauses.slice(0, numPauses);

    //   pauses.sort(function(a, b) {
    //     return a.index - b.index;
    //   });

    //   segment.pauses = [];
    //   for (var i = 0; i < pauses.length; i++) {
    //     var pause = pauses[i];

    //     if (pause.index > GOOD_LENGTH && pause.index < segment.notes.length - GOOD_LENGTH) {
    //       if (!pauses[i-1] || pause.index - pauses[i-1].index > GOOD_LENGTH) {
    //         segment.pauses.push(pause);
    //       }
    //     } 
    //   }
    // }

    Songs.update(songId, {
      $set: {
        genre: genre,
        segments: song.segments,
        segmentIds: song.segmentIds,
        isGamified: true,
      }
    });
  },

  oldGamify: function(songId, genre) {
    var song = Songs.findOne(songId);

    if (Meteor.userId() !== song.creatorId) {
      throw new Meteor.Error(413, 'User must be the original creator.');
    }

    var leftSegments = [];
    var rightSegments = [];

    // distinguish left hand from right hand
    for (var j = 0; j < song.segmentIds.length; j++) {
      var segmentId = song.segmentIds[j];

      var averageNote = 0;
      var numNotes = 0;

      var averageSegmentNote = 0;
      var numSegmentNotes = 0

      var i;
      for (i = 0; i < song.notes.length; i++) {
        if (song.notes[i].segmentId === segmentId) {
          break ;
        } 
      }

      var startIndex = i;

      for (; i < song.notes.length; i++) {
        var note = song.notes[i];
        averageNote += note.note;
        numNotes++;

        if (note.segmentId === segmentId) {
          averageSegmentNote += note.note;
          numSegmentNotes++;

          if (note.isEnd === true) {
            break;
          }
        }
      }

      var endIndex = i;

      averageNote /= numNotes;
      averageSegmentNote /= numSegmentNotes;

      segment = {
        segmentId: segmentId,
        startIndex: startIndex,
        endIndex: endIndex,
      }

      if (averageSegmentNote < averageNote) {
        leftSegments.push(segment);
      } else {
        rightSegments.push(segment);
      }
    }

    // sort the segments
    function hasBiggerStartIndex    (a, b) {
      return a.startIndex > b.startIndex;
    }

    leftSegments.sort(hasBiggerStartIndex);
    rightSegments.sort(hasBiggerStartIndex);

    // update the leadStartIndex
    // leftSegments[0].leadStartIndex = 0;
    // rightSegments[0].leadStartIndex = 0;

    for (var i = 0; i < leftSegments.length; i++) {
      var segment = leftSegments[i];
      segment.leadStartIndex = segment.startIndex;

      for (var j = segment.startIndex - 1; j >= 0; j--) {
        if (song.notes[segment.startIndex].time - song.notes[j].time > 100) { // TODO: use CLUSTER_TIME
          segment.leadStartIndex = j + 1;
          break;
        }
      }
    }

    for (var i = 0; i < rightSegments.length; i++) {
      var segment = rightSegments[i];
      segment.leadStartIndex = segment.startIndex;

      for (var j = segment.startIndex - 1; j >= 0; j--) {
        if (song.notes[segment.startIndex].time - song.notes[j].time > 100) { // TODO: use CLUSTER_TIME
          segment.leadStartIndex = j + 1;
          break;
        }
      }
    }

    // update the leadEndIndex
    if (leftSegments.length > 0){
      leftSegments[leftSegments.length - 1].leadEndIndex = song.notes.length - 1;
    }
    if (rightSegments.length > 0){
      rightSegments[rightSegments.length - 1].leadEndIndex = song.notes.length - 1;
    }

    for (var i = 0; i < leftSegments.length - 1; i++) {
      leftSegments[i].leadEndIndex = leftSegments[i+1].leadStartIndex - 1;
    }

    for (var i = 0; i < rightSegments.length - 1; i++) {
      rightSegments[i].leadEndIndex = rightSegments[i+1].leadStartIndex - 1;
    }



    Songs.update(songId, {
      $set: {
        genre: genre,
        leftSegments: leftSegments,
        rightSegments: rightSegments,
        isGamified: true,
      }
    });

  },

});

