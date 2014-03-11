
// MAX / INCREMENT (e.g. 100/5) must be even for things to update properly
var INCREMENT = 5;
var MAX = 100;
var MIN = 0;

MetronomeRecorder = {
  save: function() {
    // var time = 0;
    // for (var i = 0; i < this.notes.length; i++) {
    //   var note = this.notes[i];
    // }
  },

  init: function() {
    this.period = 500;
    this.reset();

    var self = this;

    $(window).on('keyboardDown.recorder', function(evt, data) {
      self.numDownKeys++;

      self.temporaryNotes.push({
        note: data.note,
        keyCode: data.keyCode,
        beat: Session.get('beat'),
        duration: 0,
      });

      if (self.numDownKeys === 1) {
        self.interval = window.setInterval(function() {
          self.incrementIndicator(INCREMENT);
        }, self.period / (MAX / INCREMENT));
      }
    });

    $(window).on('keyboardUp.recorder', function(evt, data) {
      if (self.numDownKeys > 0) {
        self.numDownKeys--;
      }

      for (var i = 0; i < self.temporaryNotes.length; i++) {
        var note = self.temporaryNotes[i];

        // transfer the temporary note to notes
        if (note.note === data.note) {
          self.temporaryNotes.splice(i, 1);

          if (note.duration === 0) {
            note.duration = 1;
          }

          if (self.notes.length === 0) {
            self.notes.push(note);
          } else {
            // make sure it is in the correct order
            for (var j = self.notes.length - 1; j >= 0; j--) {
              var stableNote = self.notes[j];

              if (stableNote.beat <= note.beat) {
                self.notes.splice(j + 1, 0, note);
                break ;
              }

              if (j === 0) {
                self.notes.splice(j, 0, note); 
              }
            }
          }
        }
      }

      if (self.numDownKeys === 0) {
        self.pauseIndicator();
      }
    });

    $(window).on('keydown.recorder', function(evt) {
      if (evt.keyCode === 32) {
        evt.preventDefault();
      } else if (evt.keyCode === 46) {
        self.notes.pop();
        Session.set('recordedNotes', self.notes);
        if (self.notes.length > 0) {
          var note = self.notes[self.notes.length - 1];
          Session.set('beat', note.beat + note.duration);
        } else {
          Session.set('beat', 0);
        }
      }
    });

    $(window).on('blur.recorder', function(evt) {
      self.pauseIndicator();
      self.temporaryNotes = [];
    });

    $(window).on('focus.recorder', function(evt) {
      self.numDownKeys = 0;
    });
  },

  destroy: function() {
    $(window).off('keyboardDown.recorder');
    $(window).off('keyboardUp.recorder');
    $(window).off('keydown.recorder');
    $(window).off('blur.recorder');
    $(window).off('focus.recorder');
  },

  reset: function() {
    // this.pauseIndicator();
    this.interval = null;    
    this.indicatorIncreasing = true;

    this.numDownKeys = 0;
    this.notes = [];
    this.temporaryNotes = [];

    Session.set('recordedNotes', []);
    Session.set('indicatorValue', 0);
    Session.set('beat', 0);
  },

  incrementIndicator: function() {
    var value = Session.get('indicatorValue');

    if (this.indicatorIncreasing) {
      if (value < MAX) {
        Session.set('indicatorValue', value + INCREMENT);
      } else {
        Session.set('indicatorValue', value - INCREMENT);
        this.indicatorIncreasing = false;
      }
    } else {
      if (value > MIN) {
        Session.set('indicatorValue', value - INCREMENT);
      } else {
        Session.set('indicatorValue', value + INCREMENT);
        this.indicatorIncreasing = true;
      }
    }

    // var newValue = Session.get('indicatorValue');
    if (value === MIN || value === MAX) {
      Session.set('beat', Session.get('beat') + 1);

      for (var i = 0; i < this.temporaryNotes.length; i++) {
        var note = this.temporaryNotes[i];
        note.duration += 1;
      }
      Session.set('recordedNotes', combine(this.notes, this.temporaryNotes));
    }
  },

  pauseIndicator: function() {
    window.clearInterval(this.interval);
    this.interval = null;

    if (this.indicatorIncreasing) {
      Session.set('indicatorValue', MAX);
    } else {
      Session.set('indicatorValue', MIN);
    }
  },

  addNotes: function(notes) {
    for (var i = 0; i < notes.length; i++) {
      this.notes.push(notes[i]);
    }
  },

}

function combine(a, b) {
  var ret = [];
  for (var i = 0; i < a.length; i++) {
    ret.push(a[i]);
  }
  for (var i = 0; i < b.length; i++) {
    ret.push(b[i]);
  }
  return ret;
}