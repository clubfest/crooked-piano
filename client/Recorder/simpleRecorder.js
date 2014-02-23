///////// TODO: init the simpleRecorder correctly with the songId
simpleRecorder = {
  notes: [],
  offset: 0,
  songId: null,

  init: function(songId) {
    this.songId = songId;

    this.disconnectKeyboardToRecorder();
    this.connectKeyboardToRecorder();
    this.reset();
  },

  destroy: function() {
    this.disconnectKeyboardToRecorder();
  },

  updateOffset: function(offset) {
    this.offset = offset;
  },

  reset: function() {
    Session.set('hasRecordedNotes', false);
    this.notes = [];
    this.offset = 0;
    this.start();
  },

  start: function() {
    Session.set('isRecording', true);
  },

  stop: function() {
    Session.set('isRecording', false);
  },

  clear: function() {
    this.notes = [];
    Session.set('hasRecordedNotes', false);
  },

  save: function() {
    var self = this;

    Meteor.call('createSong', self.notes, Monotrome.getFrequency(), Monotrome.getTime(), function(err, songId) {
      if (err) {
        alert(err.reason);
      } else {
        self.onSave(songId);
      }
    });
  },

  saveSegment: function() {
    var self = this;
    var segmentId = (new Date).getTime();
    var newNotes = [];
    $.each(this.notes, function(idx, note) {
      if (note.isFromReplayer !== true) {
        note.time -= self.offset;
        note.segmentId = segmentId;
        newNotes.push(note);
      }
    });

    Meteor.call('addSegmentToSong', newNotes, this.songId, function(err) {
      if (err) {
        alert(err.reason);
      } else {
        self.reset();
        simpleReplayer.reset();
      }
    });
  },

  onSave: function(songId) {
    Router.go('editSong', {_id: songId});
  },

  connectKeyboardToRecorder: function() {
    var self = this;

    $(window).on('keyboardDown.recorder', function(evt, data) {
      if (Session.get('isRecording') === true) {
        dataCopy = $.extend({}, data); // bizarre bug if I don't clone
        dataCopy.isKeyboardDown = true;
        self.notes.push(dataCopy);
        Session.set('hasRecordedNotes', true);
      }
    })

    $(window).on('keyboardUp.recorder', function(evt, data) {
      if (Session.get('isRecording') === true) {
        data.isKeyboardDown = false;
        self.notes.push(data);
      }
    });
  },

  disconnectKeyboardToRecorder: function() {
    $(window).off('keyboardDown.recorder');
    $(window).off('keyboardUp.recorder');
  },
};
