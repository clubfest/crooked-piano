
// TODO: think about whether to store each segment individually
// TODO: think about adding id to each note
Template.upload.rendered = function() {
  var midiInput = document.getElementById('midi-input');
  midiInput.onchange = function(evt) {
    var fileList = midiInput.files;
    if (fileList.length > 0) {
      var file = fileList[0];
      var fileReader = new FileReader;

      fileReader.onload = function() {
        var player = MIDI.Player;

        Session.set('message', 'Uploading');
        try {
          player.loadFile(fileReader.result);
        } catch (e) {
          Session.set('message', 'Upload failed');
          return ;
        }

        Session.set('message', 'Tranlating');

        var shift = parseInt($('#shift-input').val());
        var numTracks = parseInt($('#num-tracks-input').val());

        Translator.midiToNotes(player.data, shift, numTracks);
        Translator.createTranslatedSong();
        Session.set('message', '');

      }

      fileReader.readAsDataURL(file);
    }
  }
}

// translate to gamified song by adding extra info: isStart and isEnd
var Translator = {
  notes: [],
  notesByTrack: {},
  
  midiToNotes: function(data, shift, numTracks) {
    this.convertToMyFormat(data, numTracks);
    this.smartShift(shift); // TODO: remove this, once we modify the computer to play notes and display a different-octave keyCode
    this.annotateKeyCode();
  },

  convertToMyFormat: function(data, numTracks) {
    this.notes = [];
    this.notesByTrack = {};

    var time = 0;

    for (var i = 0; i < data.length; i++) {
      var noteInfo = data[i];
      var event = noteInfo[0].event;

      time += noteInfo[1];

      if (event.subtype === "noteOn" || event.subtype === "noteOff") {
        var segmentId = noteInfo[0].track;

        if (isNaN(numTracks) || segmentId <= numTracks) {

          var note = {
            time: time,
            note: event.noteNumber,
            velocity: event.velocity,
            segmentId: segmentId,
          }

          if (event.subtype === "noteOn") {
            note.isKeyboardDown = true;
          } 
          this.notes.push(note);

          if (!this.notesByTrack[segmentId]) {
            this.notesByTrack[segmentId] = {
              notes: [],
              // segmentId: segmentId,
            };
          }
          this.notesByTrack[segmentId].notes.push(note);
        }


      } else {
        // todo: add instrument info
      }
    }
    // annotation is needed for gamification later on
    for (var segmentId in this.notesByTrack) {
      var trackNotes = this.notesByTrack[segmentId].notes;

      if (trackNotes.length > 0) {
        trackNotes[0].isStart = true;
        trackNotes[trackNotes.length - 1].isEnd = true;
      }
    }
  },

  smartShift: function(bestShift) {
    // Find a shift that produces the least number of sharps
    if (isNaN(bestShift)) {
      var minNumBlackKeys = Infinity;
      var bestShift = 0;

      for (var j = 0; j < 12; j++) {
        numBlackKeys = 0;

        for (var i = 0; i < Math.min(this.notes.length, 100); i++) {
          if (isBlackKey(this.notes[i].note + j)) {
            numBlackKeys++;
          }
        }

        if (numBlackKeys < minNumBlackKeys) {
          minNumBlackKeys = numBlackKeys;
          bestShift = j;
        }
      }

      // Shift to the correct octave
      var prevDiff = diffOfOutKeys(this.notes, bestShift);

      if (prevDiff < 0) {
        var currDiff = diffOfOutKeys(this.notes, bestShift+12);
        if (Math.abs(currDiff) < Math.abs(prevDiff)) {
          bestShift += 12;
        }
      } else {
        var currDiff = diffOfOutKeys(this.notes, bestShift-12);

        if (Math.abs(currDiff) < Math.abs(prevDiff)) {
          bestShift -= 12;
        }
      }
    }

    for (var i = 0; i < this.notes.length; i++) {
      this.notes[i].note += bestShift;
    }
  },

  annotateKeyCode: function() {
    // translate
    for (var i = 0; i < this.notes.length; i ++) {
      var noteNumber = this.notes[i].note;
      var keyCode = window.noteToKeyCode[noteNumber];

      if (!keyCode) {
        while (noteNumber > 84) {
          noteNumber -= 12;
        } 
        while (noteNumber < 47) {
          noteNumber += 12;
        }

        keyCode = window.noteToKeyCode[noteNumber];
      }

      this.notes[i].keyCode = keyCode;
      this.notes[i].note = noteNumber;
    }    
  },

  createTranslatedSong: function() {
    Meteor.call('createTranslatedSong', this.notes, this.notesByTrack, function(err, songId) {
      if (err) {
        alert(err.reason);
      } else {
        Router.go('addSegment', {_id: songId});
      }
    });
  }
}
  



function isBlackKey(i) {
  var blackKeys = [1, 3, 6, 8, 10];

  i -= 60; // TODO: use middleC instead
  i = (i % 12) + (i < 0 ? 12 : 0);

  return (blackKeys.indexOf(i) > -1)
}

function diffOfOutKeys(notes, shift) {
  // Difference of over the range vs under the range keys
  var diff = 0;
  for (var i = 0; i < Math.min(notes.length, 200); i++) {
    var note = notes[i].note;
    // console.log(note + shift);

    if (note + shift > 86) {
      diff += 2; // note that I hate high notes more than low notes
    } else if (note + shift < 41) {
      diff -= 1;
    }
  }
  return diff;
}
