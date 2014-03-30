
PracticeMode = {
  init: function() {
    this.score = 0;
    this.currentNote = this.getNextNotes()[0];

    var self = this;
    $(window).on('keyboardDown.practiceMode', function(evt, data) {
      console.log(data.noteNumber)
      console.log(self.currentNote.noteNumber)
      if (data.noteNumber === self.currentNote.noteNumber ||
          data.keyCode === self.currentNote.keyCode) {
        self.currentNote = self.getNextNotes()[0];
        MidiReplayer.displayNote(self.currentNote);
        MidiReplayer.start();
      }
    });
  },

  destroy: function() {
    $(window).off('keyboardDown.practiceMode');
  },

  getNextNotes: function() {
    // get notes from our track at the next closest time
    // sort by lowest to highest noteNumb
    var ret = [];
    var noteTime;
    if (this.currentNote) {
      var time = this.currentNote.startTimeInTicks;
    } else {
      var time =  Session.get('timeInTicks') || 0;
    }

    var currentTrackId = Session.get('currentTrackId');
    for (var i = 0; i < MidiReplayer.notes.length; i++) {
      var note = MidiReplayer.notes[i];

      if (note.subtype === 'noteOn'
          && note.startTimeInTicks > time 
          && note.trackId === currentTrackId) { // TODO: is it > or >= ?
        if (!noteTime) {
          ret.push(note);
          noteTime = note.startTimeInTicks;
        } else {
          if (noteTime === note.startTimeInTicks) {
            ret.push(note);
          } else {
            break;
          }
        }
      }
    }

    ret.sort(function(a, b) {
      return - a.noteNumber + b.noteNumber;
    });

    return ret;
  },

  handleData: function(data) {
    if (data.action === 'play') {
      if (data.note.subtype === 'noteOn' 
          && data.note.trackId === Session.get('currentTrackId')) {
console.log(data.note);
console.log(this.currentNote);
        // Play the note but pause at the next note
        MidiReplayer.pause();

        // must update manually. Otherwise, we will keep playing and pausing at the same note
        // other modes may not require update because there is no pause
        Session.set('replayerIndex', data.replayerIndex + 1); 
      } else {
        // this.noteShallPass = false;
        // data.note.velocity /= 3; // todo: adjust this else where
        MidiReplayer.playNote(data.note);
      }
    } else if (data.action === 'stop') {
      MidiReplayer.stop();
    }
  },
}