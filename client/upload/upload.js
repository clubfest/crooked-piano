
// TODO: think about whether to store each segment individually
// TODO: think about adding id to each note
Template.upload.rendered = function() {
  var midiInput = document.getElementById('midi-input');

  midiInput.onchange = function(evt) {
    // todo: add waiting cursor
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

        Translator.midiToNotes(player.data);
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
  
  midiToNotes: function(data) {
    this.notes = [];
    this.notesByTrack = {};
    this.trackNames = [];
    this.songInfo = [];

    var time = 0;

    for (var i = 0; i < data.length; i++) {
      var noteInfo = data[i];
      var event = noteInfo[0].event;
      
      time += noteInfo[1];

      if (event.subtype === "noteOn" || event.subtype === "noteOff") {
        var segmentId = noteInfo[0].track;
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

      } else {
        if (event.subtype === 'trackName') {
          if (!this.notesByTrack[noteInfo[0].track]) {
            this.notesByTrack[noteInfo[0].track] = {
              notes: [],
            }
          }

          // Save the instrument name
          this.notesByTrack[noteInfo[0].track].text = event.text;
        }
      }
    }

    for (var segmentId in this.notesByTrack) {
      if (this.notesByTrack[segmentId].notes.length === 0) {
        this.songInfo.push(this.notesByTrack[segmentId].text);
        delete this.notesByTrack[segmentId];
      } else {
        // annotation is needed for gamification later on
        var trackNotes = this.notesByTrack[segmentId].notes;

        if (trackNotes.length > 0) {
          trackNotes[0].isStart = true;
          trackNotes[trackNotes.length - 1].isEnd = true;
        }
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
    Meteor.call('createTranslatedSong', this.notes, this.notesByTrack, this.songInfo, function(err, songId) {
      if (err) {
        alert(err.reason);
      } else {
        Router.go('editSong', {_id: songId});
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

    var newNote = note + shift;
    if (newNote > 84) {
      if ([86, 88, 89, 90, 91, 93].indexOf(newNote) > -1) {
        diff += 2; // note that I hate high notes more than low notes
      } else {
        diff += 100; // notes that need to be shifted down sound really bad
      }
    } else if (note + shift < 47) {
      diff -= 1;
    }
  }
  return diff;
}
