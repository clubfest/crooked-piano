WAIT_TIME = 300;
CLUSTER_TIME = 50000;

YouPlayer = {
  init: function(song) {
    var self = this;

    this.song = song;
    this.playNotes = song.notes;
    this.timeouts = [];
    Session.set('isSynchronous', true);
    Session.set('playSpeed', 0.8);
    Session.set('backgroundVolume', 0.8);    
    // this.reset();


    // simpleRecorder.init();
  },

  destroy: function() {
    $(window).off('keyboardDown.youPlayer');
    this.reset();
  },

  start: function() {
    this.reset();
    this.paused = false;
    var self = this;

    $(window).off('keyboardDown.youPlayer');
    $(window).on('keyboardDown.youPlayer', function(evt, data) {
      if (data.playedByComputer !== true) {
        self.judge(data);
      }
    });
    this.updateProximateNotes();
  },

  pause: function() {
    this.destroy();
  },

  reset: function() {
    for (var i = 0; i < this.timeouts.length; i++) {
      clearTimeout(this.timeouts[i]);
    }

    this.timeouts = [];
    this.paused = true;   

    Session.set('numCorrect', 0);
    Session.set('numWrong', 0);
    Session.set('isWrong', false);
    Session.set('score', null);
    Session.set('scoreTallied', false);

    if (!Session.get('replayerIndex')) {
      Session.set('replayerIndex', 0);
    }

    // simpleRecorder.stop();
    // simpleRecorder.clear();
    // simpleRecorder.start();

    if (this.proximateNotes && this.computerProximateNotes) {
      this.undisplayNotes();
    }

    this.proximateNotes = [];
    this.computerProximateNotes = [];
    this.prevNoteTime = null;
  },

  switchTrack: function(newTrackId) { 
    this.undisplayNotes();

    if (typeof newTrackId === "undefined") {
      for (var i = 0; i < this.computerProximateNotes.length; i++) {
        var note = this.computerProximateNotes[i];
        if (note.trackId !== this.getTrackId()) {
          newTrackId = note.trackId;
          break;
        }
      }   

      if (typeof newTrackId === "undefined") {
        for (var i = this.getReplayerIndex(); i < this.playNotes.length; i++) {
          var note = this.playNotes[i];
          if (note.trackId !== this.getTrackId()) {
            newTrackId = note.trackId;
            break;
          }
        }
      }
    }

    if (typeof newTrackId !== "undefined") {
      Session.set('currentTrackId', newTrackId);
    }

    this.transferProximateNotesToComputer();
    this.redisplayNotes();
  },

  transferProximateNotesToComputer: function() {
    if (this.proximateNotes.length > 0) {
      // Write test: Why splice instead of push?
      this.computerProximateNotes.splice(0, 0, this.proximateNotes.pop());
      this.playComputerProximateNotes();
      this.updateProximateNotes();
    }
  },

  judge: function(data) {
    var matchIdx = -1;

    for (var i = 0; i < this.proximateNotes.length; i++) {
      var note = this.proximateNotes[i];

      if (data.noteNumber === note.noteNumber || data.keyCode === note.keyCode) {
        matchIdx = i;
        break ;
      }
    }

    if (matchIdx > -1) {
      this.incrementScore();
      if (Session.get('isSynchronous')) {
        var res = this.proximateNotes.splice(matchIdx, 1);
        this.undisplayNote(note);
        this.prevNoteTime = note.startTimeInMicroseconds;
      }

      // the held back computer notes can now be played
      if (this.proximateNotes.length === 0) {
        if (this.computerProximateNotes.length > 0) {          
          this.playComputerProximateNotes();
        }
        this.updateProximateNotes();
      }
    } else {
      // if (data.playedByComputer !== true) {
        this.decrementScore();
      // }
    }
  },

  isComputerNote: function(note) {
    return note.trackId !== this.getTrackId();
  },

  updateProximateNotes: function() {
    if (this.getReplayerIndex() >= this.playNotes.length &&
        this.proximateNotes.length === 0 &&
        this.computerProximateNotes.length === 0) {
      this.gameOver();
      return;
    }
    
    if (this.getReplayerIndex() >= this.playNotes.length ||
        this.proximateNotes.length > 0 ) {
      return;
    }

    while(this.getReplayerIndex() < this.playNotes.length) {
      var note = $.extend({}, this.playNotes[this.getReplayerIndex()]);
      this.incrementReplayerIndex(); // TODO: simplify this

      if (note.subtype !== 'noteOn') {
        continue;
      } 

      Session.set('timeInTicks', note.startTimeInTicks); 
      
      if (Session.get('shift') !== 0 || !note.keyCode) {
        note.noteNumber += Session.get('shift') || 0;
        note.keyCode = convertNoteToKeyCode(note.noteNumber);
      }

      if (this.isComputerNote(note)) {
        this.computerProximateNotes.push(note);
      } else {
        $(window).trigger('noteProcessed', note); // for lyrics display
        if (this.proximateNotes.length > 0) {
          if (note.noteNumber > this.proximateNotes[0].noteNumber) {
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

      var nextNote = this.getNextNoteOn();
      if (!nextNote || nextNote.startTimeInMicroseconds - note.startTimeInMicroseconds > CLUSTER_TIME) {
        break;
      }
    }

    this.redisplayNotes();
    this.playFreeNotes();
  },

  playFreeNotes: function() {
    if (this.proximateNotes.length === 0) {
      if (this.computerProximateNotes.length > 0) {
        var wait = 0;
        var self = this; 
        
        if (this.prevNoteTime !== null) {
          wait = (this.computerProximateNotes[0].startTimeInMicroseconds - this.prevNoteTime) / Session.get('playSpeed') / 1000;
        }

        this.timeouts.push(window.setTimeout(function() {
          self.playComputerProximateNotes();
          if (!self.paused) {
            self.updateProximateNotes();
          }
        }, wait));
      }
    } else if (!Session.get('isSynchronous')) {
      var wait = 0;
      var self = this;

      if (this.prevNoteTime !== null) {
        wait = (this.proximateNotes[0].startTimeInMicroseconds - this.prevNoteTime) / Session.get('playSpeed') / 1000;
      }
      self.prevNoteTime = this.proximateNotes[0].startTimeInMicroseconds;

        

      this.timeouts.push(window.setTimeout(function() {
        if (self.computerProximateNotes.length > 0) {          
          self.playComputerProximateNotes();
        }
        self.undisplayNotes();
        self.proximateNotes = [];
        if (!self.paused) {
          self.updateProximateNotes();
        }
      }, wait));
    }
  },

  playComputerProximateNotes: function() { 
    var self = this;
    var notes = this.computerProximateNotes;
    for (var j = 0; j < notes.length; j++) {
      // must do this first as we will change the time for recording purposes

      if (notes[j].subtype === 'noteOn') {
        var computerNote = $.extend({},notes[j]);
        computerNote.velocity *= Session.get('backgroundVolume'); // make computer less loud

        if (notes.length > 4) {
          computerNote.velocity *= 3 / notes.length;
        }

        computerNote.pedalOn = true;

        this.prevNoteTime = notes[j].startTimeInMicroseconds; 
      
        computerNote.playedByComputer = true;
        computerNote.time = new Date().getTime(); // for recording

        $(window).trigger('keyboardDown', computerNote);

        self.undisplayComputerNote(computerNote);

        var duration = (computerNote.endTimeInMicroseconds - computerNote.startTimeInMicroseconds) / 1000;
        window.setTimeout(function(note) {        
          $(window).trigger('keyboardUp', note); // for recording purposes
        }, duration, computerNote);
      }
    }  
    this.computerProximateNotes = []; 
  },

  gameOver: function() {
    Session.set('replayerIndex', 0);
    YouPlayer.pause();
    // var self = this; 
    // TODO: record the melodic part
    // self.saveGame();

    // window.setTimeout(function() { 
    //   tallyScore();
    // }, WAIT_TIME);
  },

  saveGame: function() {
    // simpleRecorder.stop();

    // // compute the last note for merging purposes; must be in timeout to have all the notes
    // for (var i = simpleRecorder.notes.length - 1; i >= 0; i--) {
    //   var endNote = simpleRecorder.notes[i];
    //   if (endNote.isKeyboardDown === true) {
    //     endTime = endNote.time;
    //     break;
    //   }  
    // }

    // var version = this.getTrackId();
    // var tempLength = TempGames.incomplete.length;

    // if (tempLength > 0) {
    //   var incomplete = TempGames.incomplete[tempLength - 1];
    //   if (incomplete.songId !== this.song._id) {
    //     TempGames.incomplete = []; // reset if you moved to a new song
    //   } else if (TempGames.incomplete[tempLength - 1].trackId === this.getTrackId()) {
    //     TempGames.incomplete.pop();
    //   }
    // }

    // if (this.playNotes.length < 1 || simpleRecorder.notes.length < 1) return;

    // TempGames.incomplete.push({
    //   songId: this.song._id,
    //   title: this.song.title,
    //   notes: simpleRecorder.notes,
    //   startTime: simpleRecorder.notes[0].time,
    //   originalStartTime: this.playNotes[0].time,
    //   endTime: endTime,
    //   originalEndTime: this.playNotes[this.playNotes.length - 1].time,
    //   version: version,
    //   trackId: this.getTrackId(),
    // });
  },

  coincidingNextNotes: function(note) {
    /* For seeing if any proximateNotes match with next cluster of proximateNotes */
    var idx = this.getReplayerIndex();

    while(idx < this.playNotes.length) {
      var nextNote = this.playNotes[idx];
      if (nextNote.subtype === 'noteOn' && nextNote.trackId === note.trackId) {
        if (nextNote.noteNumber + (Session.get('shift')||0) === note.noteNumber) {
          return true;
        } else {
          return false;
        }
      }
      idx++;
    }

    return false;
  },

  displayNote: function(note) {
    var displayClass = 'my-note '
    if (this.coincidingNextNotes(note)) {
      displayClass += " repeated-note"
    }

    var dom = $('[data-key-code='+note.keyCode+']');

    if (dom.hasClass('computer-note')) {
      dom.removeClass('computer-note');
    }
    dom.addClass(displayClass);
    dom.html('<span>'+dom.data('content')+'</span>')
  },

  displayComputerNote: function(note) {
    var dom = $('[data-key-code='+note.keyCode+']');
    if (!dom.hasClass('my-note')) {
      dom.addClass('computer-note');
      dom.html('<span>'+noteToName(note.noteNumber, Session.get('isAlphabetNotation'))+'</span>');
    }

    // for (var i = 0; i < 2; i++) {
    //   noteNumber = note.noteNumber + i * 12;
    //   dom = $('[data-note='+noteNumber+']');
    //   dom.addClass('computer-note');
    //   dom.html('<span>'+noteToName(noteNumber, Session.get('isAlphabetNotation'))+'</span>');
    // }
      
  },

  undisplayNotes: function() {
    for (var i = 0; i < this.computerProximateNotes.length; i++) {
      this.undisplayComputerNote(this.computerProximateNotes[i]);
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

  undisplayComputerNote: function(note) {
    var dom = $('[data-key-code='+note.keyCode+']');
    dom.removeClass('computer-note');
  },

  undisplayNote: function(note) {
    // TODO: undisplay repeated notes properly
    var dom = $('[data-key-code='+note.keyCode+']');
    dom.removeClass('my-note repeated-note');

    // for (var i = 0; i < 2; i++) {
    //   noteNumber = note.noteNumber + 12 * i;
    //   dom = $('[data-note='+noteNumber+']');
    //   dom.removeClass('my-note computer-note repeated-note');
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

  incrementReplayerIndex: function() {
    Session.set('replayerIndex', Session.get('replayerIndex') + 1);
  },

  getReplayerIndex: function() {
    return Session.get('replayerIndex');
  },

  getIndex: function() {
    if (this.proximateNotes) {
      return Session.get('replayerIndex') - this.proximateNotes.length - this.computerProximateNotes.length;
    } else {
      return Session.get('replayerIndex');
    }
  },

  getNextNoteOn: function() {
    for (var i = this.getReplayerIndex(); i < this.playNotes.length; i++) {
      var note = this.playNotes[i];
      if (note.subtype === 'noteOn') {
        return note;
      }
    }
  },

  getTrackId: function() {
    return Session.get('currentTrackId');
  },
}


tallyScore = function() {
  var score = 100 * Session.get('numCorrect') /(Session.get('numCorrect') + Session.get('numWrong'));

  Session.set('score', 0);
  window.setTimeout(function() {
    tallyingScore(score);
  }, 5 * WAIT_TIME);
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

















  // demo: function() {
  //   if (Session.get('isSynchronous')) {
  //     this.transferProximateNotesToComputer();
  //   } else {
  //     // don't update because the computer notes will be loaded in the wrong order
  //   }
    
  //   if (this.computerProximateNotes.length === 0 ||this.getReplayerIndex() === this.playNotes.length) {
  //     this.reset();
  //     this.updateProximateNotes();
  //   }
  // },

  // pauseDemo: function() {
  //   Session.set('isDemoing', false);
  // },