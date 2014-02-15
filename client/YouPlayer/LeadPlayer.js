// IMPORTANT: proximateNotes is at most length 1;

WAIT_TIME = 300;
CLUSTER_TIME = 50;

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

    simpleRecorder.init();

    this.loadPlayNotes();

    if (song.segmentIds.length > 0) {
      this.segmentId = parseInt(song.segmentIds[0].segmentId);
      // this.segmentId = this.playNotes[0].segmentId;
    }

    this.reset();
    this.updateProximateNotes();
  },

  reset: function(playIndex) {
    Session.set('numCorrect', 0);
    Session.set('numWrong', 0);
    Session.set('isWrong', false);
    Session.set('score', null);
    Session.set('isDemoing', false);
    Session.set('scoreTallied', false);

    if (!playIndex) {
      playIndex = 0;
    }

    Session.set('playIndex', playIndex);

    simpleRecorder.stop();
    simpleRecorder.clear();
    simpleRecorder.start();


    if (this.proximateNotes && this.computerProximateNotes) {
      this.undisplayNotes();
    }

    this.proximateNotes = [];
    this.computerProximateNotes = [];
    this.prevNoteTime = null;
  },

  destroy: function() {
    var highestTimeoutId = setTimeout(";");
    for (var i = 0 ; i < highestTimeoutId ; i++) {
        clearTimeout(i); 
    }
    this.reset();
    $(window).off('keyboardDown.youPlayer');
  },

  loadPlayNotes: function() {
    // var goodBreak = Math.min(this.segmentInfo.endIndex + 200, this.song.notes.length - 1);
    this.playNotes = []
    for (var i = 0; i < this.song.notes.length; i++) {
      var note = this.song.notes[i];

      if (note.isKeyboardDown === true) {
        this.playNotes.push(note);        
      }
    }
    Session.set('playLength', this.playNotes.length); // for the game template
  },

  switchTrack: function() { 
    var newSegmentId = null;

    for (var i = 0; i < this.computerProximateNotes.length; i++) {
      var note = this.computerProximateNotes[i];
      if (note.segmentId !== this.segmentId) {
        newSegmentId = note.segmentId;
        break;
      }
    }   

    if (newSegmentId === null) {
      for (var i = this.getPlayIndex(); i < this.playNotes.length; i++) {
        var note = this.playNotes[i];
        if (note.segmentId !== this.segmentId) {
          newSegmentId = note.segmentId;
          break;
        }
      }
    }

    if (newSegmentId !== null) {
      this.segmentId = newSegmentId;
    }

    this.transferProximateNotesToComputer();
  },

  transferProximateNotesToComputer: function() {
    if (this.proximateNotes.length > 0) {
      this.computerProximateNotes.splice(0,0, this.proximateNotes.pop());
      this.playComputerProximateNotes();
      this.updateProximateNotes();
    }
  },

  judge: function(data) {
    var matchIdx = -1;

    for (var i = 0; i < this.proximateNotes.length; i++) {
      var note = this.proximateNotes[i];

      if (data.note === note.note) {
        matchIdx = i;
        break ;
      }
    }

    if (matchIdx > -1) {
      this.incrementScore();
      if (Session.get('isSynchronous')) {
        this.proximateNotes.splice(matchIdx, 1);
        this.undisplayNote(note);
        this.prevNoteTime = note.time;
      }

      // the held back computer notes can now be played
      if (this.proximateNotes.length === 0) {
        if (this.computerProximateNotes.length > 0) {          
          this.playComputerProximateNotes();
        }
        this.updateProximateNotes();

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

    if (Session.get('isSynchronous')) {
      this.transferProximateNotesToComputer();
    }

    // var notes = [];
    // var i = this.getPlayIndex() - this.proximateNotes.length - this.computerProximateNotes.length;
    // for ( ; i < this.playNotes.length; i++) {
    //   var note = this.playNotes[i];
    //   if (!this.isComputerNote(note)) {
    //     notes.push(note);
    //     var noteUp = $.extend(true, {}, note);
    //     $.extend(noteUp, {
    //       isKeyboardDown: false,
    //       time: note.time + 1000,
    //     });
    //     notes.push(noteUp);
    //   }
    // }

    // simpleReplayer.init(notes);
    // simpleReplayer.play();
  },

  pauseDemo: function() {
    Session.set('isDemoing', false);
  },

  isComputerNote: function(note) {
    return note.segmentId !== this.segmentId;
  },

  updateProximateNotes: function() {
    if (this.getPlayIndex() >= this.playNotes.length &&
        this.proximateNotes.length === 0 &&
        this.computerProximateNotes.length === 0) {
      this.gameOver();
      return;
    }
    
    if (this.getPlayIndex() >= this.playNotes.length ||
        this.proximateNotes.length > 0) {
      return;
    }

    while(1) {

      var note = this.playNotes[this.getPlayIndex()];
      this.incrementPlayIndex(); // TODO: simplify this

      if (Session.get('isDemoing') || this.isComputerNote(note)) {
        this.computerProximateNotes.push(note);

      } else {
        if (this.proximateNotes.length > 0) {
          if (note.note > this.proximateNotes[0].note) {
          // TODO: add bass instrument
          // if (note.note < this.proximateNotes[0].note) {
            var lowerNote = this.proximateNotes[0];
            var higherNote = note;
          } else {
            var lowerNote = note;
            var higherNote = this.proximateNotes[0];
          }

          this.computerProximateNotes.push(lowerNote);
          this.proximateNotes = [higherNote];

        } else {
          this.proximateNotes = [note];
        }
      }

      if (this.getPlayIndex() === this.playNotes.length ||
          this.playNotes[this.getPlayIndex()].time - note.time > CLUSTER_TIME) {
        break;
      }
    }

    this.redisplayNotes();

    if (this.proximateNotes.length === 0) {
      if (this.computerProximateNotes.length > 0) {
        var wait = 0;
        var self = this; 
        
        if (this.prevNoteTime !== null) {
          wait = (this.computerProximateNotes[0].time - this.prevNoteTime) / Session.get('playSpeed');
        }

        window.setTimeout(function() {
          self.playComputerProximateNotes();
          self.updateProximateNotes();
        }, wait);
      }
    } else if (!Session.get('isSynchronous')) {
      var wait = 0;
      var self = this;

      if (this.prevNoteTime !== null) {
        wait = (this.proximateNotes[0].time - this.prevNoteTime) / Session.get('playSpeed');
      }
      self.prevNoteTime = this.proximateNotes[0].time;

        

      window.setTimeout(function() {
        if (self.computerProximateNotes.length > 0) {          
          self.playComputerProximateNotes();
        }
        self.undisplayNotes();
        self.proximateNotes = [];
        self.updateProximateNotes();
      }, wait);
    }
  },

  playComputerProximateNotes: function() { 
    var self = this;
    var notes = this.computerProximateNotes;

    for (var j = 0; j < notes.length; j++) {
      var computerNote = $.extend({},notes[j]);
      computerNote.velocity /= 2.5; // make computer less loud

      // must do this first as we will change the time for recording purposes
      this.prevNoteTime = notes[j].time; 

      computerNote.playedByComputer = true;
      computerNote.time = new Date().getTime(); // for recording

      $(window).trigger('keyboardDown', computerNote);

      self.undisplayNote(computerNote);

      window.setTimeout(function(note) {        
        $(window).trigger('keyboardUp', note); // for recording purposes
      }, 200, computerNote);

    }  
    this.computerProximateNotes = []; 
  },

  // playProximateNotes: function() { 
  //   var self = this;
  //   var notes = this.proximateNotes;

  //   for (var j = 0; j < notes.length; j++) {
  //     var note = $.extend({}, notes[j]);
  //     // computerNote.velocity /= 2; // make computer less loud

  //     // must do this first as we will change the time for recording purposes
  //     this.prevNoteTime = notes[j].time; 

  //     note.playedByComputer = true;
  //     note.time = new Date().getTime(); // for recording

  //     $(window).trigger('keyboardDown', note);

  //     self.undisplayNote(note);

  //     window.setTimeout(function(note) {        
  //       $(window).trigger('keyboardUp', note); // for recording purposes
  //     }, 200, note);

  //   }  
  //   this.proximateNotes = []; 
  // },

  gameOver: function() {
    var self = this; 
    if (Session.get('isDemoing')) {
      // simpleReplayer.destroy();
      $("<div class='demo-message' align='center'>It's your turn to play it.</div>").prependTo('body');
      self.reset();

    } else {
      // TODO: record the melodic part
      // self.saveGame();

      window.setTimeout(function() { 
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

    var version = this.segmentId;
    var tempLength = TempGames.incomplete.length;

    if (tempLength > 0) {
      var incomplete = TempGames.incomplete[tempLength - 1];
      if (incomplete.songId !== this.song._id) {
        TempGames.incomplete = []; // reset if you moved to a new song
      } else if (TempGames.incomplete[tempLength - 1].segmentId === this.segmentId) {
        TempGames.incomplete.pop();
      }
    }

    if (this.playNotes.length < 1 || simpleRecorder.notes.length < 1) return;

    TempGames.incomplete.push({
      songId: this.song._id,
      title: this.song.title,
      notes: simpleRecorder.notes,
      startTime: simpleRecorder.notes[0].time,
      originalStartTime: this.playNotes[0].time,
      endTime: endTime,
      originalEndTime: this.playNotes[this.playNotes.length - 1].time,
      version: version,
      segmentId: this.segmentId,
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

    var dom = $('[data-key-code='+note.keyCode+']');
    dom.addClass(displayClass);
    dom.html('<span>'+dom.data('content')+'</span>')
  },

  displayComputerNote: function(note) {
    var dom = $('[data-key-code='+note.keyCode+']');
    dom.addClass('computer-note')
    if (!dom.hasClass('first-cluster')) {
      dom.html('<span>'+noteToName(note.note, Session.get('isAlphabetNotation'))+'</span>');
    }
  },

  undisplayNotes: function() {
    for (var i = 0; i < this.computerProximateNotes.length; i++) {
      this.undisplayNote(this.computerProximateNotes[i]);
    }

    for (var i = 0; i < this.proximateNotes.length; i++) {
      this.undisplayNote(this.proximateNotes[i]);

    }
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
    // TODO: undisplay repeated notes properly
    var dom = $('[data-key-code='+note.keyCode+']');
    dom.removeClass('first-cluster computer-note repeated-note');
    // if (dom.hasClass('repeated-note')) {
    //   dom.removeClass('repeated-note');
    //   dom.addClass('first-cluster');
    // } else {
    //   dom.removeClass('first-cluster computer-note');
    // }
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
