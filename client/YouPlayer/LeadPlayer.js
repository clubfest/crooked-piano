WAIT_TIME = 1000;
CLUSTER_TIME = 100;

LeadPlayer = {
  create: function() {
    var self = this;
    $(window).on('keyboardDown.youPlayer', function(evt, data) {
      self.judge(data);
    });

    $(window).on('keyboardUp.youPlayer', function() {
      $('.stat').removeClass('big-stat');
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

    this.proximateNotes = [];
    this.prevNoteTime = null;
    this.updateProximateNotes();
  },

  destroy: function() {
    $(window).off('keyboardDown.youPlayer');
  },

  loadPlayNotes: function() {
    for (var i = 0; i < this.song.notes.length; i++) {
      var note = this.song.notes[i];
      this.playNotes.push(note);        
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
      if (!this.isComputerNote(note)) {
        this.incrementScore();
      }
      this.proximateNotes.splice(matchIdx, 1);
      this.undisplayNote(note);
      this.prevNoteTime = note.time;
  
      if (this.proximateNotes.length > 0 && this.proximateNotes[0].isComputerNote) {
        this.playComputerNotes(this.proximateNotes);
      }

      this.updateProximateNotes();

      //// Game over
      if (this.proximateNotes.length === 0) {
        var self = this; 

        window.setTimeout(function() {
          if (Session.get('isDemoing')) {
            simpleReplayer.destroy();
            $("<div class='demo-message' align='center'>It's your turn to play it.</div>").prependTo('body');
            self.reset();
          } else {
            self.tallyScore();
          }
        }, WAIT_TIME);          
      }

    } else {
      this.decrementScore();
    }
  },

  demo: function() {
    if (this.getPlayIndex() === this.playNotes.length) {
      this.reset();
    }

    Session.set('isDemoing', true);
    $('.demo-message').remove();

    var notes = [];
    var i = this.getPlayIndex() - this.proximateNotes.length
    for ( ; i < this.playNotes.length; i++) {
      var note = this.playNotes[i];
      if (!this.isComputerNote(note))
      notes.push(note);
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
    while(this.proximateNotes.length === 0) {
      if (this.getPlayIndex() === this.playNotes.length) {
        return ;
      }

      var proximateNote = this.playNotes[this.getPlayIndex()];
      this.incrementPlayIndex();
      if (proximateNote.isKeyboardDown === true) {
        this.proximateNotes.push(proximateNote);
        if (this.isComputerNote(proximateNote)) {          
          proximateNote.isComputerNote = true;
          this.displayComputerNote(proximateNote);
        } else {
          this.displayNote(proximateNote);
        }
      }
    }

    // Add new note if the first note's time differ by less than 100 ms
    while (this.getPlayIndex() < this.playNotes.length) {
      var note = this.playNotes[this.getPlayIndex()];
      if (note.time - this.proximateNotes[0].time < CLUSTER_TIME) {
        this.incrementPlayIndex();

        if (note.isKeyboardDown === true) {
          if (this.isComputerNote(note)) {
            note.isComputerNote = true;
            this.proximateNotes.push(note);
            this.displayComputerNote(note);
          } else {
            this.proximateNotes.splice(0, 0, note);
            this.displayNote(note);
          }
        } 
      } else break;
    }

    if (this.proximateNotes.length > 0 && this.proximateNotes[0].isComputerNote) {
      var wait = 0;
      
      if (this.prevNoteTime !== null) {
        wait = this.proximateNotes[0].time - this.prevNoteTime;
      }

      var self = this;
      var clone = self.proximateNotes.slice(0);
      window.setTimeout(function() {
        self.playComputerNotes(clone); // clone is needed
      }, wait);
    }
  },

  playComputerNotes: function(notes) {
    for (var j = 0; j < notes.length; j++) {
      var computerNote = notes[j]

      $(window).trigger('keyboardDown', computerNote);

      window.setTimeout(function() {
        $(window).trigger('keyboardUp', computerNote);
      }, 400);

      this.prevNoteTime = computerNote.time;
    }         
  },

  displayNote: function(note) {
    $('[data-key-code='+note.keyCode+']').addClass('first-cluster');
  },

  displayComputerNote: function(note) {
    $('[data-key-code='+note.keyCode+']').addClass('computer-note');
  },

  redisplayNotes: function() {
    for (var i = 0; i < this.proximateNotes.length; i++) {
      this.displayNote(this.proximateNotes[i])
    }
  },

  undisplayNote: function(note) {
    $('[data-key-code='+note.keyCode+']').removeClass('computer-note');
    $('[data-key-code='+note.keyCode+']').removeClass('first-cluster');
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

  tallyScore: function() {
    var score = 100 * Session.get('numCorrect') /(Session.get('numCorrect') + Session.get('numWrong'));

    Session.set('score', 0);
    window.setTimeout(function() {
      incrementScore(score);
    }, WAIT_TIME);
  },
}
