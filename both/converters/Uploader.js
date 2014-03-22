// We will only modify each midi event:
//   microsecondsPerBeat
// We won't add new event types here

Uploader = {
  load: function(midiFile, fileName) {
    this.midi = midiFile;
    this.fileName = fileName;
    this.ticksPerBeat = this.midi.header.ticksPerBeat;
    this.idIndex = 0; // used to annotate id during addStartTimeInBeats
    // TODO: get source address if obtained via gamify

    this.debug();
    this.loadTempoEventsAndTimeSignatures();
    this.addStartTimeInBeats(); // as well as id and trackId
    this.addStartTimeInMicroseconds();
    this.addEndTime();

    this.merge();
    this.save();
  },

  debug: function() {
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];
      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        if (event.type === 'meta') {
          console.log(event);
        }
      }
    }
  },
  save: function() {
    Meteor.call('createSongFile', {
      fileName: this.fileName, 
      midi: this.midi, 
      notes: this.notes,
      tempos: this.tempos, 
      timeSignatures: this.timeSignatures,
    }, function(err, songId) {
      if (err) {
        alert(err.reason);
      } else {
        Router.go('songFile', {_id: songId});
      }
    });
  },

  merge: function() {
    this.notes = [];
    var tracks = this.midi.tracks;
    var currentLocations = [];
    var numFinished = 0;

    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].length > 0) {
        currentLocations.push(0);
      } else {
        numFinished++;
      }
    }

    for (;numFinished < tracks.length;) {
      var earliestTime = null;
      var earliestTrackId = null;

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        var currentLocation = currentLocations[i];

        if (currentLocation !== null) {
          var note = track[currentLocation];

          if (earliestTime === null || note.startTimeInBeats < earliestTime) {
            earliestTime = note.startTimeInBeats;
            earliestTrackId = i;
          }
        }
      }

      var earliestTrack = tracks[earliestTrackId];
      this.notes.push(earliestTrack[currentLocations[earliestTrackId]]);

      if (currentLocations[earliestTrackId] + 1 === earliestTrack.length ) {
        currentLocations[earliestTrackId] = null;
        numFinished++;
      } else {
        currentLocations[earliestTrackId] += 1;
      }
    }
  },

  addStartTimeInMicroseconds: function() {
    // add info needed for replaying
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var startTime = 0;
      var track = this.midi.tracks[trackId];
      var tempoIndex = 0;
      var microsecondsPerBeat = 500000; // midi default

      var timeInMicroseconds = 0;

      for (var i = 0; i < track.length; i++) {
        var event = track[i];

        // must change unit of deltaTime if tempo changes at the current note
        if (tempoIndex < this.tempos.length
            && event.startTimeInBeats >= this.tempos[tempoIndex].startTimeInBeats) {
          var diffInTicks = (event.startTimeInBeats - this.tempos[tempoIndex].startTimeInBeats) * this.ticksPerBeat;

          // before tempo change
          timeInMicroseconds += (event.deltaTime - diffInTicks) / this.ticksPerBeat * microsecondsPerBeat;

          microsecondsPerBeat = this.tempos[tempoIndex].microsecondsPerBeat;
          tempoIndex++;

          // after tempo change
          timeInMicroseconds += diffInTicks / this.ticksPerBeat * microsecondsPerBeat;
          
        } else {
          timeInMicroseconds += event.deltaTime / this.ticksPerBeat * microsecondsPerBeat;
        }

        event.startTimeInMicroseconds = timeInMicroseconds;
      }
    }
  },

  addEndTime: function() {
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
              noteOnEvent.endTimeInMicroseconds = event.startTimeInMicroseconds;

              // annotate with id
              noteOnEvent.noteOffId = event.id;
              event.noteOnId = noteOnEvent.id;

              // sanity check       
              var duration = noteOnEvent.endTimeInBeats - noteOnEvent.startTimeInBeats

              if (duration > 16) {
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

        event.id = this.idIndex++; // needed to update noteOn and noteOff pair
        event.trackId = trackId; // needed to propagate song.notes changes to the track
        event.note = event.noteNumber; // for backward compatibility

        timeInTicks += event.deltaTime;
        event.startTimeInBeats = timeInTicks / this.ticksPerBeat;
      }
    }
  },  

  // The info should be in track 0, but we will be cautious and look in all tracks
  loadTempoEventsAndTimeSignatures: function() {
    this.tempos = [];
    this.timeSignatures = [];
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];

      for (var i = 0; i < track.length; i++) {
        var event = track[i];
        if (event.subtype === 'setTempo') {
          this.tempos.push(event);
        } else if (event.subtype === 'timeSignature') {
          this.timeSignatures.push(event);
        }
      }
    }
  },
}

// this is for fractional display purposes
// we will compute the near by note duration
// to see what the correct multiplier should be
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