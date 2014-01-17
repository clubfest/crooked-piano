

AccompanyingPlayer = {
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
      this.incrementScore();
      this.proximateNotes.splice(matchIdx, 1);
      this.undisplayNote(note);
      this.prevNoteTime = note.time;
      this.updateProximateNotes();
      if (this.proximateNotes.length === 0) {

        var self = this; // give some time for the last keyup to fire in demo
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

    simpleReplayer.init(this.playNotes.slice(this.getPlayIndex()-this.proximateNotes.length, this.playNotes.length));
    simpleReplayer.play();
  },

  pauseDemo: function() {
    simpleReplayer.pause();
  },

  updateProximateNotes: function() {
    while(this.proximateNotes.length === 0) {
      if (this.getPlayIndex() > this.playNotes.length - 1) {
        return ;
      }

      var proximateNote = this.playNotes[this.getPlayIndex()];
      this.incrementPlayIndex();
      if (proximateNote.isKeyboardDown === true) {
        this.proximateNotes.push(proximateNote);
        if (proximateNote.segmentId === this.segmentId) {          
          this.displayNote(proximateNote);
        } else {
          this.displayComputerNote(proximateNote);

          var wait = 0;
          if (this.prevNoteTime !== null) {
            wait = proximateNote.time - this.prevNoteTime;
          }
          window.setTimeout(function() {
            $(window).trigger('keyboardDown', proximateNote)
            window.setTimeout(function() {
              $(window).trigger('keyboardUp', proximateNote);
            }, 400);
          }, wait);
        }
      }
    }

    // Add new note if the first note's time differ by less than 100 ms
    var startTime = this.proximateNotes[0].time;

    while (this.getPlayIndex() < this.playNotes.length) {
      var note = this.playNotes[this.getPlayIndex()];
      if (note.time - startTime < 100) {
        this.incrementPlayIndex();

        if (note.isKeyboardDown === true) {
          this.proximateNotes.push(note);
          if (note.segmentId === this.segmentId) {
            this.displayNote(note);
          } else {
        console.log(note);

            this.displayComputerNote(note);
          }
        } else {
          // console.log(note)
        }
      } else {
        return ;
      }
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
    }, WAIT_TIME * 1.5);
  },
}
