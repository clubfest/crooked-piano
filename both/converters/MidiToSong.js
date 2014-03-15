
Converter = {
  load: function(midiFile, fileName) {
    this.midi = midiFile;
    this.fileName = fileName;

    // Needed to approx # of beat for a note
    this.ticksPerBeat = this.midi.header.ticksPerBeat;

    this.addTicksFromStart();
    this.addBeatDuration();

    this.extractTempo();

    this.addAbsoluteTime();
    console.log(this.midi.tracks)

  },

  addAbsoluteTime: function() {

  },

  extractTempo: function() {
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];

      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        if (event.subtype === 'setTempo') {
          // console.log('setTempo')
          // console.log(event);
          // console.log(trackId)
        } else if (event.subtype === 'timeSignature') {
          // console.log('timeSignature')
          // console.log(event);
          // console.log(trackId)
        }
      }
    }
  },

  // todo: dynamic rounding
  addBeatDuration: function() {
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];

      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        if (event.channel === 0 && i > 40 && i < 100) {
          console.log(event)
        }
        if (event.subtype === 'noteOff') {
          var strange = 0;

          for (var j = i - 1; j >= 0; j--) {
            var noteOnEvent = track[j];
            if (noteOnEvent.subtype === 'noteOn') {
              if (noteOnEvent.noteNumber === event.noteNumber &&
                  noteOnEvent.channel === event.channel) {
                if (noteOnEvent.durationInBeats && i < 100) {
                  strange = noteOnEvent.beatsFromStart;
                  console.log('Duration already defined:');
                  console.log(noteOnEvent);
                } else {
                  if (strange) {
                    // console.log('strange');
                    // console.log(strange - noteOnEvent.beatsFromStart);
                  }
                  noteOnEvent.durationInBeats = event.beatsFromStart - noteOnEvent.beatsFromStart;          
                  break ;
                }
              }
            }
          }
          // if (!matched) {
          //   console.log('not matched: ');
          //   console.log(event);
          // }
        }
      }

      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        if (event.subtype === 'noteOn') {
          if (event.durationInBeats <= 0) {
            console.log('duration is non-positive: ');
            console.log(event);
          event.durationInBeats = 1;

          } else if (!event.durationInBeats) {
            console.log('missing duration beat: ');
            console.log(event);
          event.durationInBeats = 1;
            
          }

        }
      }
    }
  },

  addTicksFromStart: function() {
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];
      var ticksFromStart = 0;

      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        event.trackId = trackId;
        ticksFromStart += event.deltaTime;
        event.ticksFromStart = ticksFromStart;
        event.beatsFromStart = ticksFromStart / this.ticksPerBeat;
      }
    }
  },    


}

// todo: dynamic multipliers depending to prevent noteOn from being moved
function roundUp(beat, multipliers) {

  var attempts = [];

  var multipliers = multipliers || [6, 8]; // for coarser, use [3, 4]
  for (var i = 0; i < multipliers.length; i++) {
    var multiplier = multipliers[i];
    attempts.push(Math.ceil(multiplier * beat) / multiplier);
  }

  var minChange;
  var minIndex;

  for (var i = 0; i < attempts.length; i++) {
    if (!minChange || attempts[i] - beat < minChange) {
      minChange = attempts[i] - beat;
      minIndex = i;
    }
  }

  console.log(beat + '--------------');
  console.log(attempts[minIndex])
  return attempts[i];

}

function notesToMusicalNotes(notes) {

}

var clone = function (o) {
  if (typeof o != 'object') return (o);
  if (o == null) return (o);
  var ret = (typeof o.length == 'number') ? [] : {};
  for (var key in o) ret[key] = clone(o[key]);
  return ret;
};

midiToMusicalNotes = function(midiFile) {
  var trackStates = [];
  var beatsPerMinute = 120;
  var ticksPerBeat = midiFile.header.ticksPerBeat;
  
  for (var i = 0; i < midiFile.tracks.length; i++) {
    trackStates[i] = {
      'nextEventIndex': 0,
      'ticksToNextEvent': (
        midiFile.tracks[i].length ?
          midiFile.tracks[i][0].deltaTime :
          null
      )
    };
  }

  var nextEventInfo;
  var samplesToNextEvent = 0;
  
  function getNextEvent() {
    var ticksToNextEvent = null;
    var nextEventTrack = null;
    var nextEventIndex = null;
    
    for (var i = 0; i < trackStates.length; i++) {
      if (
        trackStates[i].ticksToNextEvent != null
        && (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
      ) {
        ticksToNextEvent = trackStates[i].ticksToNextEvent;
        nextEventTrack = i;
        nextEventIndex = trackStates[i].nextEventIndex;
      }
    }
    if (nextEventTrack != null) {
      /* consume event from that track */
      var nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
      if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
        trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
      } else {
        trackStates[nextEventTrack].ticksToNextEvent = null;
      }
      trackStates[nextEventTrack].nextEventIndex += 1;
      /* advance timings on all tracks by ticksToNextEvent */
      for (var i = 0; i < trackStates.length; i++) {
        if (trackStates[i].ticksToNextEvent != null) {
          trackStates[i].ticksToNextEvent -= ticksToNextEvent
        }
      }
      return {
        "ticksToEvent": ticksToNextEvent,
        "event": nextEvent,
        "track": nextEventTrack
      }
    } else {
      return null;
    }
  };
  //
  var midiEvent;
  var temporal = [];
  //
  function processEvents() {
    function processNext() {
      if ( midiEvent.event.type == "meta" && midiEvent.event.subtype == "setTempo" ) {
        // tempo change events can occur anywhere in the middle and affect events that follow
        beatsPerMinute = 60000000 / midiEvent.event.microsecondsPerBeat;
      } 
      if (midiEvent.ticksToEvent > 0) {
        var beatsToGenerate = midiEvent.ticksToEvent / ticksPerBeat;
        var secondsToGenerate = beatsToGenerate / (beatsPerMinute / 60);
      }
      var time = (secondsToGenerate * 1000) || 0;
      temporal.push([ midiEvent, time]);
      midiEvent = getNextEvent();
    };
    //
    if (midiEvent = getNextEvent()) {
      while(midiEvent) processNext(true);
    }
  };
  processEvents();
  return {
    "getData": function() {
      return clone(temporal);
    }
  };
};