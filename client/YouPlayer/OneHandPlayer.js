
OneHandPlayer = {
  create: function() {
    var self = this;
    $(window).on('keyboardDown.youPlayer', function(evt, data) {
      self.judge(data);
    });

    this.song = Session.get('song');
    this.playNotes = [];

    var numRight = this.song.rightSegments.length;
    
    if (Session.get('segmentLevel') < numRight) {
      this.segmentInfo = this.song.rightSegments[Session.get('segmentLevel')];
    } else {
      this.segmentInfo = this.song.leftSegments[Session.get('segmentLevel') - numRight];
    }

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
    this.prevNoteTime = null;
    this.updateProximateNotes();
  },

  destroy: function() {
    $(window).off('keyboardDown.youPlayer');
  },

  loadPlayNotes: function() {
    for (var i = 0; i < this.song.notes.length; i++) {
      var note = this.song.notes[i];

      if (this.isPlayerNote(note) && note.isKeyboardDown === true) {
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
      this.updateProximateNotes();

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
    var i = this.getPlayIndex() - this.proximateNotes.length;

    for ( ; i < this.playNotes.length; i++) {
      var note = this.playNotes[i];
      notes.push(note);
      var noteUp = $.extend(true, {}, note);
      $.extend(noteUp, {
        isKeyboardDown: false,
        time: note.time + 200,
      });
      notes.push(noteUp);
    }

    simpleReplayer.init(notes);
    simpleReplayer.play();
  },

  pauseDemo: function() {
    simpleReplayer.pause();
  },

  isPlayerNote: function(note) {
    return note.segmentId === this.segmentInfo.segmentId;
  },

  updateProximateNotes: function() {
    if (this.getPlayIndex() >= this.playNotes.length &&
        this.proximateNotes.length === 0) {
      this.gameOver();
      return;
    }
    
    if (this.getPlayIndex() >= this.playNotes.length ||
        this.proximateNotes.length > 0) {
      return;
    }

    while(1) {

      var note = this.playNotes[this.getPlayIndex()];
      this.incrementPlayIndex();
      this.proximateNotes.push(note);
      this.displayNote(note);

      if (this.getPlayIndex() === this.playNotes.length ||
          this.playNotes[this.getPlayIndex()].time - note.time > CLUSTER_TIME) {
        break;
      }
    }
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

    $('[data-key-code='+note.keyCode+']').addClass(displayClass);
  },


  redisplayNotes: function() {
    for (var i = 0; i < this.proximateNotes.length; i++) {
      this.displayNote(this.proximateNotes[i]);
    }
  },

  undisplayNote: function(note) {
    $('[data-key-code='+note.keyCode+']').removeClass('first-cluster repeated-note');      
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
      return Session.get('playIndex') - this.proximateNotes.length;
    } else {
      return Session.getIndex;
    }
  },
}

// tallyScore = function() {
//   var score = 100 * Session.get('numCorrect') /(Session.get('numCorrect') + Session.get('numWrong'));

//   Session.set('score', 0);
//   window.setTimeout(function() {
//     tallyingScore(score);
//   }, 5 * WAIT_TIME);
// }

tallyScore = function() {
  var score = 100 * Session.get('numCorrect') /(Session.get('numCorrect') + Session.get('numWrong'));

  Session.set('score', Math.floor(score));
  Session.set('scoreTallied', true);
}

function tallyingScore(score) {
  var oldScore = Session.get('score');
  var time = oldScore / 2;
  if (score - oldScore < 8) {
    time = 1000 / ((score - oldScore) + 1)
  }
  if (oldScore < score) {
    Session.set('score', oldScore + 1);
    MIDI.noteOn(0, Math.floor(oldScore*score % 47) + 40, oldScore / 4);
    window.setTimeout(function() {
      tallyingScore(score);
    }, time);
  } else {
    Session.set('scoreTallied', true);
  }
}
