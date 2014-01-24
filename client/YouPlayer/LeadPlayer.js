WAIT_TIME = 300;
CLUSTER_TIME = 100;

LeadPlayer = {
  create: function(song) {
    var self = this;
    $(window).on('keyboardDown.youPlayer', function(evt, data) {
      if (data.playedByComputer !== true) {
        self.judge(data);
      }
    });

    this.song = song;
    this.playNotes = [];

    if (typeof this.song !== 'undefined') {
      var numRight = this.song.rightSegments.length;
    }
    
    if (Session.get('segmentLevel') < numRight) {
      this.segmentInfo = this.song.rightSegments[Session.get('segmentLevel')];
      Session.set('isRightHand', true);
    } else {
      this.segmentInfo = this.song.leftSegments[Session.get('segmentLevel') - numRight];
      Session.set('isRightHand', false);
    }

    simpleRecorder.init();

    this.loadPlayNotes();
    this.reset();

  },

  reset: function() {
    Session.set('numCorrect', 0);
    Session.set('numWrong', 0);
    Session.set('playIndex', 0);
    Session.set('isWrong', false);
    Session.set('score', null);
    Session.set('isDemoing', false);
    Session.set('scoreTallied', false);
    simpleRecorder.stop();
    simpleRecorder.clear();
    simpleRecorder.start();

    this.proximateNotes = [];
    this.computerProximateNotes = [];
    this.prevNoteTime = null;
    this.updateProximateNotes();
  },

  destroy: function() {
    $(window).off('keyboardDown.youPlayer');
  },

  loadPlayNotes: function() {
    for (var i = this.segmentInfo.leadStartIndex; i <= this.segmentInfo.leadEndIndex; i++) {
      var note = this.song.notes[i];

      if (note.isKeyboardDown === true) {
        this.playNotes.push(note);        
      }
    }

    Session.set('playLength', this.playNotes.length);      
  },

  judge: function(data) {
    var matchIdx = -1;

    for (var i = 0; i < this.proximateNotes.length; i++) {
      var note = this.proximateNotes[i];

      if (data.keyCode === note.keyCode) {
        matchIdx = i;
        break ;
      }
    }

    if (matchIdx > -1) {
      this.incrementScore();
      this.proximateNotes.splice(matchIdx, 1);
      this.undisplayNote(note);
      this.prevNoteTime = note.time;

      // the held back computer notes can now be played
      if (this.proximateNotes.length === 0) {
        if (this.computerProximateNotes.length > 0) {          
          this.playComputerProximateNotes();
        } else {
          this.updateProximateNotes();
        }
      }
    } else {
      if (data.playedByComputer !== true) {
        this.decrementScore();
      }
    }

  },

  demo: function() {
    if (this.getPlayIndex() === this.playNotes.length) {
      this.reset();
    }

    Session.set('isDemoing', true);
    $('.demo-message').remove();

    var notes = [];
    var i = this.getPlayIndex() - this.proximateNotes.length - this.computerProximateNotes.length;
    for ( ; i < this.playNotes.length; i++) {
      var note = this.playNotes[i];
      if (!this.isComputerNote(note)) {
        notes.push(note);
        var noteUp = $.extend(true, {}, note);
        $.extend(noteUp, {
          isKeyboardDown: false,
          time: note.time + 200,
        });
        notes.push(noteUp);
      }
    }
    simpleReplayer.init(notes);
    simpleReplayer.play();
  },

  pauseDemo: function() {
    simpleReplayer.pause();
  },

  isComputerNote: function(note) {
    return note.segmentId !== this.segmentInfo.segmentId;
  },

  updateProximateNotes: function() {
    if (this.getPlayIndex() >= this.playNotes.length &&
        this.proximateNotes.length === 0 &&
        this.computerProximateNotes.length === 0) {
      this.gameOver();
      return;
    }
    
    if (this.getPlayIndex() >= this.playNotes.length ||
        this.proximateNotes.length > 0 ||
        this.computerProximateNotes.length > 0) {
      return;
    }

    while(1) {

      var note = this.playNotes[this.getPlayIndex()];
      this.incrementPlayIndex();

      if (this.isComputerNote(note)) {
        this.displayComputerNote(note);
        this.computerProximateNotes.push(note);
      } else {
        this.proximateNotes.push(note);
        this.displayNote(note);
      }

      if (this.getPlayIndex() === this.playNotes.length ||
          this.playNotes[this.getPlayIndex()].time - note.time > CLUSTER_TIME) {
        break;
      }
    }

    if (this.proximateNotes.length === 0) {
      if (this.computerProximateNotes.length > 0) {
        var wait = 0;
        var self = this; 
        
        if (this.prevNoteTime !== null) {
          wait = this.computerProximateNotes[0].time - this.prevNoteTime;
        }

        window.setTimeout(function() {
          self.playComputerProximateNotes();
        }, wait);
      }
    }
  },

  playComputerProximateNotes: function() {    
    var self = this;
    var notes = this.computerProximateNotes;

    for (var j = 0; j < notes.length; j++) {
      var computerNote = $.extend({},notes[j]);

      // must do this first as we will change the time for recording purposes
      this.prevNoteTime = notes[j].time; 

      computerNote.playedByComputer = true;
      computerNote.time = new Date().getTime(); // for recording

      $(window).trigger('keyboardDown', computerNote);

      self.undisplayNote(computerNote);

      window.setTimeout(function(note) {        
        $(window).trigger('keyboardUp', note); // for recording purposes
      }, 400, computerNote);

    }  
    this.computerProximateNotes = []; 
    this.updateProximateNotes();

  },

  gameOver: function() {
    var self = this; 
    if (Session.get('isDemoing')) {
      simpleReplayer.destroy();
      $("<div class='demo-message' align='center'>It's your turn to play it.</div>").prependTo('body');
      self.reset();
    } else {

      window.setTimeout(function() {
        self.saveGame();

        tallyScore();
      }, WAIT_TIME);
    }
  },

  saveGame: function() {
    simpleRecorder.stop();

    // compute the last note for merging purposes; must be in timeout to have all the notes
    for (var i = simpleRecorder.notes.length - 1; i >= 0; i--) {
      var endNote = simpleRecorder.notes[i];
      if (endNote.isKeyboardDown === true) {
        endTime = endNote.time;
        break;
      }  
    }

    var version = 'leftHandLead'
    if (Session.get('isRightHand')) {
      version = 'rightHandLead';
    }

    TempGames.incomplete.push({
      songId: this.song._id,
      title: this.song.title,
      notes: simpleRecorder.notes,
      startTime: simpleRecorder.notes[0].time,
      originalStartTime: this.playNotes[0].time,
      endTime: endTime,
      originalEndTime: this.playNotes[this.playNotes.length - 1].time,
      version: version,
    });
  },

  coincidingNextNotes: function(note) {
    /* For seeing if any proximateNotes match with next cluster of proximateNotes */
    var idx = this.getPlayIndex();

    if (idx < this.playNotes.length) {
      var nextNote = this.playNotes[idx];
      while (this.isComputerNote(nextNote)){
        idx++;

        if (idx === this.playNotes.length) {
          return false;
        }

        nextNote = this.playNotes[idx];
      }

      var nextTime = nextNote.time;

      while ( idx < this.playNotes.length && nextNote.time - nextTime < CLUSTER_TIME) {
        if (nextNote.keyCode === note.keyCode && !this.isComputerNote(nextNote)) {
          return true;
        } else {
          idx++;
          nextNote = this.playNotes[idx];
        }
      }
    }

    return false;
  },

  displayNote: function(note) {
    var displayClass = 'first-cluster '

    if (this.coincidingNextNotes(note)) {
      displayClass += " repeated-note"
    }

    $('[data-key-code='+note.keyCode+']').addClass(displayClass);
  },

  displayComputerNote: function(note) {
    $('[data-key-code='+note.keyCode+']').addClass('computer-note');
  },

  redisplayNotes: function() {
    for (var i = 0; i < this.proximateNotes.length; i++) {
      this.displayNote(this.proximateNotes[i]);
    }
    for (var i = 0; i < this.computerProximateNotes.length; i++) {
      this.displayComputerNote(this.computerProximateNotes[i]);
    }
  },

  undisplayNote: function(note) {
    $('[data-key-code='+note.keyCode+']').removeClass('first-cluster computer-note repeated-note');
  },

  incrementScore: function() {
    Session.set('numCorrect', Session.get('numCorrect') + 1);
    Session.set('isWrong', false);
  },

  decrementScore: function() {
    Session.set('numWrong', Session.get('numWrong') + 1);
    Session.set('isWrong', true);
  },

  incrementPlayIndex: function() {
    Session.set('playIndex', Session.get('playIndex') + 1);
  },

  getPlayIndex: function() {
    return Session.get('playIndex');
  },

  getIndex: function() {
    if (this.proximateNotes) {
      return Session.get('playIndex') - this.proximateNotes.length - this.computerProximateNotes.length;
    } else {
      return Session.getIndex;
    }
    
  },
}
