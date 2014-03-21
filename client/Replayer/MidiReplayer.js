
MidiReplayer = {
  // todo: decide where to clean notes
  init: function(song) {
    this.microsecondsPerBeat = 500000;
    this.notes = song.notes;
    this.tempos = song.tempos
    this.reset();

    if (Worker) {
      this.worker = new Worker('/replayerWorker.js');
      this.worker.onmessage = function(evt){
        var data = evt.data;
        if (data.action === 'play') {
          Session.set('replayerIndex', data.replayerIndex);
          MidiReplayer.playNote(MidiReplayer.notes[data.replayerIndex]);
        } else if (data.action === 'stop') {
          MidiReplayer.stop();
        }
      }
    }
  },

  updateTempo: function() { // aka microsecondsPerBeat
    // TODO: may be add currentTime and use it here
    var tempo = 500000
    for (var i = 0; i < this.tempos.length; i++) {
      var event = this.tempos[i];
      if (event.startTimeInBeats <= this.notes[Session.get('replayerIndex')].startTimeInBeats) {
        tempo = event.microsecondsPerBeat;
      } else {
        break;
      }
    }
    this.microsecondsPerBeat = tempo; // if no tempo event exist before current time
  },

  start: function() {
    Session.set('isReplaying', true);
    this.updateTempo();

    if (this.worker) {
      this.worker.postMessage({
        action: 'start', 
        notes: this.notes,
        replayerIndex: Session.get('replayerIndex'),
      }); 
    } else {
      var replayerIndex = Session.get('replayerIndex');
      playAndIncrementAndPlay();

      function playAndIncrementAndPlay() {
        var notes = MidiReplayer.notes;
        MidiReplayer.playNote(notes[replayerIndex++]);
        Session.set('replayerIndex', replayerIndex);

        if (replayerIndex < notes.length) {
          var nextStartTime = notes[replayerIndex].startTimeInMicroseconds;
          var prevStartTime = notes[replayerIndex - 1].startTimeInMicroseconds;
          var delayInMilliseconds = (nextStartTime - prevStartTime) / 1000; 

          MidiReplayer.timeoutId = setTimeout(playAndIncrementAndPlay, delayInMilliseconds);
        } else {
          MidiReplayer.stop();
        }
      }
    }
  },

  destroy: function() {
    this.stop();
    this.notes = [];
  },

  reset: function() {
    this.pause();
    Session.set('replayerIndex', 0);
  },

  pause: function() {
    Session.set('isReplaying', false);

    if (this.worker) {
      this.worker.postMessage({action: 'stop'});      
    } else {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  },

  stop: function() {
    this.pause();
    Session.set('replayerIndex', 0);
  },

  playNote: function(note) {
    note.isFromReplayer = true; // used for filtering when recording improv
    

    if (note.subtype === 'noteOn') {
      note.keyCode = convertNoteToKeyCode(note.noteNumber);
      $(window).trigger('keyboardDown', note);
    } else if (note.subtype === 'noteOff') {
      note.keyCode = convertNoteToKeyCode(note.noteNumber);
      $(window).trigger('keyboardUp', note); // not really used except for recording
    } else if (note.subtype === 'setTempo') {
      MidiReplayer.microsecondsPerBeat = note.microsecondsPerBeat;
    }
  }
}