/* 
  Session.timeInMicroseconds is the time of the note at the instance it needs to be played
  There may be various other actions and updates right at that point, like 
    * stopping
    * replayerIndex update

*/

MidiReplayer = {
  // todo: decide where to clean notes
  init: function(song) {
    this.microsecondsPerBeat = 500000;
    this.notes = song.notes;
    this.tempos = song.tempos;
    this.timeSignatures = song.timeSignatures;
    this.mode = ReplayMode; // define how processed note change the course of action

    this.loadReplayerIndexWorker();
    this.reset();
  },

  destroy: function() {
    // TODO: find out what else needs to be destroyed
    this.stop();
  },

  // for display purposes in alphabet drawer
  setCurrentTrackId: function(id){
    Session.set('currentTrackId', id);
  },

  loadPlayMode: function(mode) {
    if (this.mode.destroy) {
      this.mode.destroy(); // destroy previous mode
    }

    if (mode.init) {
      mode.init();
    }

    this.mode = mode;

    this.replayerIndexWorker.onmessage = function(evt) {
      var data = evt.data;

      // update before playFunction
      if (data.action === 'play') {
        data.note = MidiReplayer.notes[data.replayerIndex];
        Session.set('timeInTicks', data.note.startTimeInTicks);
        Session.set('replayerIndex', data.replayerIndex);
        $(window).trigger('noteProcessed', data.note);
      }

      mode.handleData(data);
    }
  },

  loadReplayerIndexWorker: function() {
    var self = this;

    this.replayerIndexWorker = new Worker('/replayerIndexWorker.js');
    this.loadPlayMode(ReplayMode);

    if (NO_WORKER) {
      // redefine onmessage and postAndSetTimeoutToPost from replayerIndexWorker.js
      this.replayerIndexWorker.onmessageToWorker = function(evt) {
        var action = evt.data.action;
        if (action === 'start') {
          self.postAndsetTimeoutToPost(evt.data.notes, evt.data.replayerIndex);

        } else if (action === 'stop') {
          clearTimeout(self.timeoutId);
        } 
      }
    }

    Deps.autorun(function() {
      MidiReplayer.replayerIndexWorker.postMessage({action: 'changeSpeed', speed: Session.get('playSpeed')});
    });
  },

  // a recursive function that delivers 
  postAndsetTimeoutToPost: function(notes, replayerIndex) {
    this.replayerIndexWorker.postMessageFromWorker({
      action: 'play', replayerIndex: replayerIndex
    });

    if (replayerIndex + 1 < notes.length) {
      var self = this;
      var nextStartTime = notes[replayerIndex + 1].startTimeInMicroseconds;
      var prevStartTime = notes[replayerIndex].startTimeInMicroseconds;
      var delayInMilliseconds = (nextStartTime - prevStartTime) / 1000 / Session.get('playSpeed');

      this.timeoutId = setTimeout(function() {
        self.postAndsetTimeoutToPost(notes, replayerIndex + 1);
      }, delayInMilliseconds);

    } else {
      this.replayerIndexWorker.postMessageFromWorker({action: 'stop'});
    }
  },

  // used only when the replayer is started
  updateTempo: function() { // aka microsecondsPerBeat
    var tempo = 500000;
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

  updateTimeSignature: function() {
    var signature = {numerator: 4, denominator: 4};
    for (var i = 0; i < this.timeSignatures.length; i++) {
      var event = this.timeSignatures[i];
      if (event.startTimeInBeats <= this.notes[Session.get('replayerIndex')].startTimeInBeats) {
        signature = event;
      } else {
        break;
      }
    }
    this.timeSignature = signature;
  },

  start: function() {
    if (Session.get('isReplaying')) {
      MidiReplayer.pause();
    }
    
    Session.set('isReplaying', true);
    this.updateTempo();
    this.updateTimeSignature();

    if (this.replayerIndexWorker) {
      this.replayerIndexWorker.postMessage({
        action: 'start', 
        notes: this.notes,
        replayerIndex: Session.get('replayerIndex'),
      }); 
    }
  },

  goBack: function(steps) {
    var steps = steps || 1;
    var trackId = Session.get('currentTrackId');

    for (var i = Session.get('replayerIndex') - 1; i >= 0; i--) {
      var note = this.notes[i];
      if (note.subtype === 'noteOn' && note.trackId === trackId) {
        steps--;
        
        if (steps === 0) {
          Session.set('replayerIndex', i);
          MidiReplayer.start();
          break ;
        }
      }
    }
  },

  goForward: function(steps) {
    var steps = steps || 1;
    var trackId = Session.get('currentTrackId');

    for (var i = Session.get('replayerIndex'); i < this.notes.length; i++) {
      var note = this.notes[i];
      if (note.subtype === 'noteOn' && note.trackId === trackId) {
        console.log(note);
        steps--;
        
        if (steps === 0) {
          Session.set('replayerIndex', i);
          MidiReplayer.start();
          break ;
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
    Session.set('timeInTicks', 0);

    this.updateTempo();
    this.updateTimeSignature();
  },

  pause: function() {
    Session.set('isReplaying', false);
    this.replayerIndexWorker.postMessage({action: 'stop'});      
  },

  stop: function() {
    this.pause();
    Session.set('replayerIndex', 0);
  },

  playNote: function(note) {
    note.isFromReplayer = true; // used for filtering when recording improv
    Session.set('timeInTicks', note.startTimeInTicks); // TODO: move this before playNote as this will not be called in edit / youPlay mode

    if (note.subtype === 'noteOn') {
      note.keyCode = convertNoteToKeyCode(note.noteNumber);
      $(window).trigger('keyboardDown', note);

    } else if (note.subtype === 'noteOff') {
      note.keyCode = convertNoteToKeyCode(note.noteNumber);
      $(window).trigger('keyboardUp', note);

    } else if (note.subtype === 'setTempo') {
      MidiReplayer.microsecondsPerBeat = note.microsecondsPerBeat;

    } else if (note.subtype === 'timeSignature') {
      MidiReplayer.timeSignature = note;
    }
  },
}
