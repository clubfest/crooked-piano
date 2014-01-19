WAIT_TIME = 1000;
CLUSTER_TIME = 100;

LeadPlayer = {
  create: function() {
    var self = this;
    $(window).on('keyboardDown.youPlayer', function(evt, data) {
      if (data.playedByComputer !== true) {
        self.judge(data);
      }
    });

    this.song = Session.get('song');
    this.playNotes = [];
    this.segmentId = this.song.segmentIds[Session.get('segmentLevel')];

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

    this.proximateNotes = [];
    this.computerProximateNotes = [];
    this.prevNoteTime = null;
    this.updateProximateNotes();
  },

  destroy: function() {
    $(window).off('keyboardDown.youPlayer');
  },

  loadPlayNotes: function() {
    var i;
    for (i = 0; i < this.song.notes.length; i++) {
      if (!this.isComputerNote(this.song.notes[i])) {
        break ;
      } 
    }

    for (; i < this.song.notes.length; i++) {
      var note = this.song.notes[i];

      if (note.isKeyboardDown === true) {
        this.playNotes.push(note);        
      }

      if (note.isEnd === true && !this.isComputerNote(note)) {
        break ;
      } 
    }
      
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
      // if (data.playedByComputer !== true) {
        this.decrementScore();
      // }
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
      var computerNote = notes[j];

      computerNote.playedByComputer = true;

      $(window).trigger('keyboardDown', computerNote);

      window.setTimeout(function(note) {        
        $(window).trigger('keyboardUp', note); // for recording purposes
        self.undisplayNote(note);
      }, 100, computerNote);

      this.prevNoteTime = computerNote.time;
    }  
    this.computerProximateNotes = []; 
    this.updateProximateNotes();

  },

  gameOver: function() {
    var self = this; 

    window.setTimeout(function() {
      if (Session.get('isDemoing')) {
        simpleReplayer.destroy();
        $("<div class='demo-message' align='center'>It's your turn to play it.</div>").prependTo('body');
        self.reset();
      } else {
        tallyScore();
      }
    }, WAIT_TIME);
  },

  coincidingNextNotes: function(note) {
    /* For seeing if any proximateNotes match with next cluster of proximateNotes */
    var idx = this.getPlayIndex();

    if (idx < this.playNotes.length) {
      var nextNote = this.playNotes[idx];
      var nextTime = nextNote.time;

      while ( idx < this.playNotes.length && nextNote.time - nextTime < CLUSTER_TIME) {
        if (nextNote.keyCode === note.keyCode) {
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

    console.log(displayClass)
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
      this.displayNote(this.computerProximateNotes[i]);
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
}
