// We will only modify each midi event:
//   microsecondsPerBeat
// We won't add new event types here

Uploader = {
  load: function(midiFile, fileName) {
    this.midi = midiFile;
    this.fileName = fileName;
    this.ticksPerBeat = this.midi.header.ticksPerBeat;
    this.noteIndex = 0; // used to annotate id during addStartTimeInBeats
    // TODO: get source address if obtained via gamify
    if (this.midi.header.formatType === 2) {
      throw "Midi of format type 2 is not supported"
    }

    this.addStartTimeInBeatsAndAnnotate(); // prepare for merging


    this.merge(); // so that we can work with a unique array from now on

    this.addStartTimeInMicroseconds(); // make replayer's job easy
    this.addEndTime();

    if (this.midi.header.formatType === 0) {
      this.splitTrackByChannel(); // needed to make extracting info easier
    }

    this.extractTrackInfos(); // e.g. to understand which is the melody, harmony, bass, drum
    this.guessMelodyTrackId(); // use melodicJumpFrequencies to find the most likely melody track

    this.save();
  },

  splitTrackByChannel: function() {
    var track = this.midi.tracks[0] // there is only 1 track for formatType 0 midi
    var maxTrackId = 0;
    var tracks = {};
    for (var i = 0; i < track.length; i++) {
      var note = track[i];
      if (!tracks[note.trackId]) {
        tracks[note.trackId] = [];
        if (note.trackId > maxTrackId) {
          maxTrackId = note.trackId;
        }
      }

      tracks[note.trackId].push(note);
    }

    this.midi.tracks = []
    for (var i = 0; i <= maxTrackId ; i++) {
      if (tracks[i]) {
        this.midi.tracks.push(tracks[i]);
      } else {
        this.midi.tracks.push([]);
      }
    }
    console.log(this.midi.tracks)
  },

  guessMelodyTrackId: function() {
    // the best is a even distribution among the first
    var scores = {};
    for (var i = 0; i < this.midi.tracks.length; i++) {
      var score = 0;
      var frequencies = this.trackInfos[i].melodicJumpFrequencies;
      var numOfNotes = this.trackInfos[i].numOfNotes;

      for (var k = -2; k <= 2; k++) {
        if (frequencies[k] / numOfNotes > 0.08) {
          score += 5;
        }
      }

      for (var k = -4; k <= 4; k++) {
        if (frequencies[k] / numOfNotes > 0.05) {
          score += 2;
        }
      }

      if (numOfNotes * this.midi.tracks.length * 4 > this.notes.length) {
        score += 3;
      }

      if (numOfNotes * this.midi.tracks.length * 5 > this.notes.length) {
        score += 2;
      }

      if (numOfNotes * this.midi.tracks.length * 6 > this.notes.length) {
        score += 1;
      }

      scores[i] = score;
    }

    var maxTrackId = 0;
    var maxScore = 0;
    for (var i = 0; i < this.midi.tracks.length; i++) {
      if (scores[i] > maxScore) {
        maxScore = scores[i];
        maxTrackId = i;
      }
    }
    console.log(scores);
    this.melodicTrackId = maxTrackId;

    for (var i = 0; i < this.midi.tracks.length; i++) {
      if (this.trackInfos[i].trackName) {
        if (this.trackInfos[i].trackName.match(/melody/i) 
            || this.trackInfos[i].trackName.match(/vocal/i)) {
          this.confirmedMelodicTrackId = i;
          if (i === this.melodicTrackId) {
            console.log('melody confirmed');
          } else {
            console.log('melody disconfirmed');
          }
        }
      }
    }
  },
  // extract and aggregate info about notes
  extractTrackInfos: function() {
    var trackInfos = {};
    var prevNoteByTrack = {};
    this.tempos = [];
    this.timeSignatures = [];
    // this.drumSounds = [];

    // Initializing so we don't need to do it later
    for (var i = 0; i < this.midi.tracks.length; i++) {
      trackInfos[i] = {
        numOfNotes: 0,
        averageNoteNumber: 0,
        melodicJumpFrequencies: {},
        rythmicJumpFrequencies: {},
        durationFrequencies: {},
      };
    }
    for (var i = 0; i < this.notes.length; i++) {
      var note = this.notes[i];
      var trackId = note.trackId;

      // remark: we don't deal with multiple trackName from the same track
      if (note.subtype === 'trackName') {
        trackInfos[trackId].trackName = note.text; // e.g. vocal, melody

      } else if (note.subtype === 'instrumentName') {
        trackInfos[trackId].instrumentName = note.text; // usually empty.

      } else if (note.subtype === 'programChange') {
        trackInfos[trackId].instrumentInfo = {
          programNumber: note.programNumber,
          channel: note.channel,
          instrumentCategory: programNumberToInstrumentCategory(note.programNumber),
          instrumentName: programNumberToInstrumentName(note.programNumber),
        };

      } else if (note.subtype === 'noteOn') {
        trackInfos[trackId].numOfNotes++;
        trackInfos[trackId].averageNoteNumber += note.noteNumber;
        // if (note.channel === 9) {
        //   this.drumSounds.push(note.noteNumber)
        // }

        var prevNote = prevNoteByTrack[trackId];

        if (prevNote) {
          var melodicJumpFrequencies = trackInfos[trackId].melodicJumpFrequencies;

          if (!melodicJumpFrequencies[note.noteNumber - prevNote.noteNumber]) {
            melodicJumpFrequencies[note.noteNumber - prevNote.noteNumber] = 0;
          }

          melodicJumpFrequencies[note.noteNumber - prevNote.noteNumber]++;

          // encoded because hash key cannot have "."
          var FINEST_BEAT = 1 / 8;
          var rythmicJumpFrequencies = trackInfos[trackId].rythmicJumpFrequencies;
          var delta = Math.floor((note.startTimeInBeats - prevNote.startTimeInBeats) / FINEST_BEAT) * FINEST_BEAT;
          delta = delta.toString().replace('.', ',');

          if (!rythmicJumpFrequencies[delta]) {
            rythmicJumpFrequencies[delta] = 0;
          }

          rythmicJumpFrequencies[delta]++;
        }
        prevNoteByTrack[trackId] = note;

      } else if (note.subtype === 'setTempo') { // TODO: remove this
        this.tempos.push(note);
      } else if (note.subtype === 'timeSignature') {
        this.timeSignatures.push(note);
      }
    }
    for (trackId in trackInfos) {
      var trackInfo = trackInfos[trackId];
      if (trackInfo.numOfNotes === 0) {
        delete trackInfos[trackId].averageNoteNumber;
      } else {
        trackInfos[trackId].averageNoteNumber /= trackInfo.numOfNotes;
      }
    }
    this.trackInfos = trackInfos;
  },

  debug: function() {
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      var track = this.midi.tracks[trackId];
      // for (var i = 0; i < track.length; i++) {
      //   var event = track[i];
      // }
        if (trackId === 0){
         console.log(track)
       }
    }
  },
  
  save: function() {
    Meteor.call('createSongFile', {
      fileName: this.fileName, 
      midi: this.midi, 
      notes: this.notes,
      noteIndex: this.noteIndex,
      trackIndex: this.midi.tracks.length,
      tempos: this.tempos, 
      timeSignatures: this.timeSignatures,
      trackInfos: this.trackInfos,
      // drumSounds: this.drumSounds,
      melodicTrackId: this.melodicTrackId,
      confirmedMelodicTrackId: this.confirmedMelodicTrackId,
      userLyrics: {},
      userComments: {},
      userTracks: {},
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

    this.sortSimultaneousNoteByNoteNumber();
  },

  sortSimultaneousNoteByNoteNumber: function() {
    this.notes.sort(function(a, b) {
      var aIsBigger = a.startTimeInBeats - b.startTimeInBeats;
      if (aIsBigger === 0) {
        aIsBigger = a.trackId - b.trackId;
        if (aIsBigger === 0) {
          if (!a.noteNumber) {
            return -1;
          } else if (!b.noteNumber) {
            return 1;
          } else {
            aIsBigger = a.noteNumber - b.noteNumber;
          }
        }
      } 

      return aIsBigger;
    });
  },

  addStartTimeInBeatsAndAnnotate: function() {
    var startTimeInBeats = 0;
    for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
      startTimeInBeats = 0;
    
      var track = this.midi.tracks[trackId];

      for (var i = 0; i < track.length; i++) {
        var event = track[i];

        if (i === 0) {
          event.startTimeInBeats = 0;
        } else {
          event.startTimeInBeats = track[i-1].startTimeInBeats + event.deltaTime / this.ticksPerBeat;
        }

        event.id = this.noteIndex++; // needed to update noteOn and noteOff pair
        if (this.midi.header.formatType === 0) {
          if (typeof event.channel === 'undefined') {
            event.trackId = 0; // this (0) is probably not used by channel
          } else {
            event.trackId = event.channel; // channel starts from 0 I think
          }
        } else {
          event.trackId = trackId; // needed to propagate song.notes changes to the track
        }
      }
    }
  },  

  addStartTimeInMicroseconds: function() {
    var microsecondsPerBeat = 500000; // midi default

    if (this.notes.length > 0) {
      this.notes[0].startTimeInMicroseconds = 0;
    }

    for (var i = 1; i < this.notes.length; i++) {
      var note = this.notes[i];
      var prevNote = this.notes[i - 1];

      var diff = note.startTimeInBeats - prevNote.startTimeInBeats;
      note.startTimeInMicroseconds = prevNote.startTimeInMicroseconds + diff  * microsecondsPerBeat;

      if (note.subtype === 'setTempo') {
        microsecondsPerBeat = note.microsecondsPerBeat;
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

  concat: function() {
    // TODO: test this with a MIDI 2 file
    this.notes = [];
    for (var i = 0; i < this.midi.tracks.length; i++) {
       Array.prototype.push.apply(this.notes, this.midi.tracks[i]);
    }
    this.notes.sortSimultaneousNoteByNoteNumber();
  },


  // // The info should be in track 0, but we will be cautious and look in all tracks
  // loadTempoEventsAndTimeSignatures: function() {
  //   this.tempos = [];
  //   this.timeSignatures = [];
  //   for (var trackId = 0; trackId < this.midi.tracks.length; trackId++) {
  //     var track = this.midi.tracks[trackId];

  //     for (var i = 0; i < track.length; i++) {
  //       var event = track[i];
  //       if (event.subtype === 'setTempo') {
  //         this.tempos.push(event);
  //       } else if (event.subtype === 'timeSignature') {
  //         this.timeSignatures.push(event);
  //       }
  //     }
  //   }
  // },
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