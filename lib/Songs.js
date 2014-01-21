
Songs = new Meteor.Collection('songs');

Meteor.methods({
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

    // saving
    var songId = Songs.insert({
      notes: notes,
      monotromeFrequency: monotromeFrequency,
      monotromeTime: monotromeTime,
      // segments: [notes],
      segmentIds: [segmentId],
      createdAt: new Date(),
      createdBy: user.username,
      creatorId: user._id,
    });

    return songId;
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

    Songs.update(songId, {
      $push: {segmentIds: segmentId},
      $set: {notes: notes},
    });

    if (song.isGamified) {
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

