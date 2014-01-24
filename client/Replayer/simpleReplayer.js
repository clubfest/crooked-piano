segmentsDep = new Deps.Dependency;

simpleReplayer = {
  notes: [],
  timeout: null,
  offset: 0,
  firstNoteTime: 0,
  firstNoteStartTime: 0,

  init: function(notes) {
    this.notes = notes;
    // this.reset(); // TODO: put it back in when switching to shark
  },

  destroy: function() {
    this.pause();
    this.notes = [];
  },

  reset: function() {
    this.pause();
    Session.set('replayerIndex', 0);
  },

  play: function() {
    if (Session.get('monotromeIsSet')) {
      Monotrome.pause(); // TODO: pause and recalculate if monotrome is running; integrate monotrome with replayer
      Monotrome.syncMonotromeWithSong();
    }

    Session.set('isReplaying', true);
    if (!Session.get('replayerIndex') ||  Session.get('replayerIndex') >= this.notes.length - 1) {
      Session.set('replayerIndex', 0)
    }

    // notify recorder of the offset
    this.firstNoteTime = this.notes[Session.get('replayerIndex')].time;
    this.firstNoteStartTime = (new Date).getTime();
    simpleRecorder.updateOffset(this.firstNoteStartTime - this.firstNoteTime);

    this._play();
  },

  pause: function() {
    console.log('paused')
    Monotrome.pause();
    window.clearTimeout(this.timeout);
    Session.set('isReplaying', false);
  },

  stop: function() {
    this.pause();
    Session.set('replayerIndex', 0);
  },

  _play: function() {
    var self = this;
    var currIndex = Session.get('replayerIndex');
    var note = this.notes[currIndex];

    // updated note's info
    note.isFromReplayer = true;

    if (note.isKeyboardDown === true) {
      $(window).trigger('keyboardDown', note);
    } else {
      $(window).trigger('keyboardUp', note);
    }

    if (currIndex >= this.notes.length - 1) {
      Session.set('isReplaying', false);
    } else {
      var nextNote = self.notes[currIndex + 1];
      var lag = ((new Date).getTime() - this.firstNoteStartTime) - (note.time - this.firstNoteTime);

      this.timeout = window.setTimeout(function() {
        Session.set('replayerIndex', currIndex + 1);
        self._play();
      },  nextNote.time - note.time - lag);
    }
  },
  
};
