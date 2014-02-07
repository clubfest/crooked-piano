
Template.upload.rendered = function() {
  var midiInput = document.getElementById('midi-input');
  midiInput.onchange = function(evt) {
    var fileList = midiInput.files;
    if (fileList.length > 0) {
      var file = fileList[0];
      var fileReader = new FileReader;

      fileReader.onload = function() {
        var player = MIDI.Player;
        player.loadFile(fileReader.result);

        Translator.midiToNotes(player.data);
        Translator.createTranslatedSong();
      }

      fileReader.readAsDataURL(file);
    }
  }
}

var Translator = {
  notes: [],

  midiToNotes: function(data) {
    this.convertToMyFormat(data);
    this.smartShift();
    this.annotateKeyCode();

    return this.notes;
  },

  convertToMyFormat: function(data) {
    this.notes = [];
    var time = 0;
    count = 0;
    for (var i = 0; i < data.length; i++) {
      var noteInfo = data[i];
      var event = noteInfo[0].event;
      if (event.subtype === 'setTempo') {
        console.log(time);
        console.log(event)
      } 
      if (event.subtype === "noteOn" || event.subtype === "noteOff") {
        count++;
        
        time += noteInfo[1];

        var note = {
          time: time,
          note: event.noteNumber,
          velocity: event.velocity,
          segmentId: noteInfo[0].track,
          isKeyboardDown: true,
        };

        if (event.subtype === "noteOff") {
          note.isKeyboardDown = false;
        }

        this.notes.push(note);
      }
    }
  },

  smartShift: function() {
    // Find a shift that produces the least number of sharps
    var minNumBlackKeys = Infinity;
    var bestShift = 0;

    for (var j = 0; j < 12; j++) {
      numBlackKeys = 0;

      for (var i = 0; i < Math.min(this.notes.length, 50); i++) {
        if (isBlackKey(this.notes[i].note + j)) {
          numBlackKeys++;
        }
      }

      if (numBlackKeys < minNumBlackKeys) {
        minNumBlackKeys = numBlackKeys;
        bestShift = j;
        console.log(numBlackKeys)
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
    Meteor.call('createTranslatedSong', this.notes, function(err, songId) {
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
  for (var i = 0; i < notes.length; i++) {
    var note = notes[i].note;

    if (note + shift > 86) {
      diff++;
    } else if (note + shift < 49) {
      diff--;
    }
  }
  return diff;
}
