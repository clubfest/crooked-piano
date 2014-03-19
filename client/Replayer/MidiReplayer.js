
MidiReplayer = {
  // todo: decide where to clean notes
  init: function(notes) {
    this.notes = notes;
    this.reset();

    if (Worker) {
      this.worker = new Worker('/replayerWorker.js');
      this.worker.onmessage = function(evt){
        var data = evt.data;
        if (data.action === 'play') {
          Session.set('replayerIndex', data.replayerIndex);
          MidiReplayer.playNote(MidiReplayer.notes[data.replayerIndex]);
        } else if (data.action === 'stop') {
          MidiReplayer.reset(); // TODO: what else?
        }
      }
    }
  },

  start: function() {
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

        if (replayerIndex < notes.length) {
          var nextStartTime = notes[replayerIndex].startTimeInMicroseconds;
          var prevStartTime = notes[replayerIndex - 1].startTimeInMicroseconds;
          var delayInMilliseconds = (nextStartTime - prevStartTime) / 1000; 

          MidiReplayer.timeoutId = setTimeout(playAndIncrementAndPlay,  delayInMilliseconds);
        } else {
          MidiReplayer.pause();
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
      $(window).trigger('keyboardDown', note);
    } else {
      $(window).trigger('keyboardUp', note); // not really used except for recording
    }
  }
}