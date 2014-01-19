
Songs = new Meteor.Collection('songs');

Meteor.methods({
  createSong: function(notes, monotromeFrequency, monotromeTime) {
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
      createdAt: new Date().getTime(),
    });

    return songId;
  },

  addSegmentToSong: function(newNotes, songId) {
    var segmentId = newNotes[0].segmentId;
    newNotes[0].isStart = true;
    newNotes[newNotes.length - 1].isEnd = true;

    var notes = Songs.findOne(songId, {notes: 1}).notes;
    notes = Mixer.mergeSortTwo(notes, newNotes);

    Songs.update(songId, {
      // $push: {segments: newNotes},
      $push: {segmentIds: segmentId},
      $set: {notes: notes},
    });
  },

  updateSongDesc: function(songId, desc) {
    Songs.update(songId, {
      $set: {desc: desc}
    });
  },
  
  updateSongTitle: function(songId, title) {
    Songs.update(songId, {
      $set: {title: title}
    });
  },

});

