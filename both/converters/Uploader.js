// We will only modify each midi event:
//   microsecondsPerBeat
// We won't add new event types here

Uploader = {
  load: function(midiFile, fileName) {
    this.midi = midiFile;
    this.fileName = fileName;
    // TODO: get source address

    // Needed to approx # of beat for a note
    this.ticksPerBeat = this.midi.header.ticksPerBeat;

    this.addStartTimeInBeats();
    this.addEndTimeInBeats();

    this.addMicroSecondInfo();
  },

  addMicroSecondInfo: function() {
    // add info needed for replaying
    var tempos = this.getTempoEvents();

    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];
      var tempoIndex = 0;
      var microsecondsPerBeat = 500000; // midi default

      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        event.startTimeInMicroseconds = event.startTimeInBeats * microsecondsPerBeat;

        // only noteOn event
        if (event.endTimeInBeats) {
          event.endTimeInMicroseconds = event.endTimeInBeats * microsecondsPerBeat;
        }

        if (tempoIndex < tempos.length
            && event.startTimeInBeats > tempos[tempoIndex].startTimeInBeats) {

          microsecondsPerBeat = tempos[tempoIndex].microsecondsPerBeat;
          tempoIndex++;
        }
      }
    }
  },

  addEndTimeInBeats: function() {
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];
      var noteOnEvents = []; // queue up noteOn events to be matched with noteOff event

      for (var i = 0; i < track.length; i++) {
        var event = track[i];

        if (event.subtype === 'noteOn') {
          noteOnEvents.push(event);
        }

        if (event.subtype === 'noteOff') {
          for (var j = 0; j < noteOnEvents.length; j++) {
            var noteOnEvent = noteOnEvents[j];
            var found = false;
            if (noteOnEvent.noteNumber  === event.noteNumber &&
                noteOnEvent.channel === event.channel) {
              noteOnEvent.endTimeInBeats = event.startTimeInBeats;
              var duration = noteOnEvent.endTimeInBeats - noteOnEvent.startTimeInBeats

              // sanity check       
              if (duration > 10) {
                console.log('Unusually long note:');
                console.log(noteOnEvent);
              } else if (duration <= 0) {
                console.log('Unusually short note:');
                console.log(noteOnEvent);
              }

              found = true;
              noteOnEvents.splice(j, 1); // remove matched events from queue
              break;
            }
          }

          if (!found) {
            console.log('Cannot match the noteOff event with things in noteOn queue:');
            console.log(event);
          }
        }
      }

      for (var i = 0; i < noteOnEvents.length; i++) {
        var event = noteOnEvents[i];
        if (event.subtype === 'noteOn') {
          console.log('This noteOn event did not get matched, so we will set it to 1 beat long: ');
          console.log(event);

          // default noteOn duration will be 1
          event.endTimeInBeats = event.startTimeInBeats + 1; 
        }
      }
    }
  },

  addStartTimeInBeats: function() {
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];
      var timeInTicks = 0;

      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        event.note = event.noteNumber; // for backward compatibility
        event.trackId = trackId; // TODO: figure out why we need this
        timeInTicks += event.deltaTime;
        event.startTimeInBeats = timeInTicks / this.ticksPerBeat;
      }
    }
  }, 

  // The info should be in track 0, but we will be cautious and look in all tracks
  getTempoEvents: function() {
    var ret = [];
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];

      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        if (event.subtype === 'setTempo') {
          ret.push(event);
        }
      }
    }
    return ret;
  },

  // The info should be in track 0, but we will be cautious and look in all tracks
  getTimeSignatures: function() {
    var ret = [];
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];

      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        if (event.subtype === 'timeSignature') {
          ret.push(event);
        }
      }
    }
    return ret;
  },   
}

// we will only use this for SheetDrawer; not for AlphabetDrawer
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

  // console.log(beat + '--------------');
  // console.log(attempts[minIndex])
  return attempts[i];

}



// // TODO: move it to drawAlphabet
//   addRestEvents: function() {
//     for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
//       var track = this.midi.tracks[trackId];

//       var restStart = 0; // current time and possibly start of a rest

//       for (var i = 0; i < track.length; i++) {
//         var event = track[i];

//         if (event.subtype === 'noteOn') {
//           if (restStart < event.timeInBeats) {
//             var newEvent = {
//               type: 'custom',
//               subtype: 'rest',
//               timeInBeats: restStart,
//               durationInBeats: event.timeInBeats - restStart,
//             }

//             track.splice(i, 0, newEvent);
//           }
          
//           restStart = Math.max(restStart, event.timeInBeats + event.durationInBeats);
//         }
//       }
//     }
//   },

// var clone = function (o) {
//   if (typeof o != 'object') return (o);
//   if (o == null) return (o);
//   var ret = (typeof o.length == 'number') ? [] : {};
//   for (var key in o) ret[key] = clone(o[key]);
//   return ret;
// };

// midiToMusicalNotes = function(midiFile) {
//   var trackStates = [];
//   var beatsPerMinute = 120;
//   var ticksPerBeat = midiFile.header.ticksPerBeat;
  
//   for (var i = 0; i < midiFile.tracks.length; i++) {
//     trackStates[i] = {
//       'nextEventIndex': 0,
//       'ticksToNextEvent': (
//         midiFile.tracks[i].length ?
//           midiFile.tracks[i][0].deltaTime :
//           null
//       )
//     };
//   }

//   var nextEventInfo;
//   var samplesToNextEvent = 0;
  
//   function getNextEvent() {
//     var ticksToNextEvent = null;
//     var nextEventTrack = null;
//     var nextEventIndex = null;
    
//     for (var i = 0; i < trackStates.length; i++) {
//       if (
//         trackStates[i].ticksToNextEvent != null
//         && (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
//       ) {
//         ticksToNextEvent = trackStates[i].ticksToNextEvent;
//         nextEventTrack = i;
//         nextEventIndex = trackStates[i].nextEventIndex;
//       }
//     }
//     if (nextEventTrack != null) {
//       /* consume event from that track */
//       var nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
//       if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
//         trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
//       } else {
//         trackStates[nextEventTrack].ticksToNextEvent = null;
//       }
//       trackStates[nextEventTrack].nextEventIndex += 1;
//       /* advance timings on all tracks by ticksToNextEvent */
//       for (var i = 0; i < trackStates.length; i++) {
//         if (trackStates[i].ticksToNextEvent != null) {
//           trackStates[i].ticksToNextEvent -= ticksToNextEvent
//         }
//       }
//       return {
//         "ticksToEvent": ticksToNextEvent,
//         "event": nextEvent,
//         "track": nextEventTrack
//       }
//     } else {
//       return null;
//     }
//   };
//   //
//   var midiEvent;
//   var temporal = [];
//   //
//   function processEvents() {
//     function processNext() {
//       if ( midiEvent.event.type == "meta" && midiEvent.event.subtype == "setTempo" ) {
//         // tempo change events can occur anywhere in the middle and affect events that follow
//         beatsPerMinute = 60000000 / midiEvent.event.microsecondsPerBeat;
//       } 
//       if (midiEvent.ticksToEvent > 0) {
//         var beatsToGenerate = midiEvent.ticksToEvent / ticksPerBeat;
//         var secondsToGenerate = beatsToGenerate / (beatsPerMinute / 60);
//       }
//       var time = (secondsToGenerate * 1000) || 0;
//       temporal.push([ midiEvent, time]);
//       midiEvent = getNextEvent();
//     };
//     //
//     if (midiEvent = getNextEvent()) {
//       while(midiEvent) processNext(true);
//     }
//   };
//   processEvents();
//   return {
//     "getData": function() {
//       return clone(temporal);
//     }
//   };
// };