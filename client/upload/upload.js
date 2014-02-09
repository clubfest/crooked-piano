
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
        Translator.midiToNotes(player.data);
        Translator.createTranslatedSong();
        Session.set('message', '');

      }

      fileReader.readAsDataURL(file);
    }
  }
}

var Translator = {
  notes: [],
  notesBySegmentId: {},
  segmentStats: {},
  
  midiToNotes: function(data) {
    this.convertToMyFormat(data);
    this.smartShift();
    this.annotateKeyCode();

    return this.notes;
  },

  convertToMyFormat: function(data) {
    this.notes = [];
    this.notesBySegmentId = {};

    var time = 0;
    prevNote = null;

    for (var i = 0; i < data.length; i++) {
      var noteInfo = data[i];
      var event = noteInfo[0].event;

      time += noteInfo[1];

      if (event.subtype === "noteOn" || event.subtype === "noteOff") {
        var track = noteInfo[0].track;
        var note = {
          time: time,
          note: event.noteNumber,
          velocity: event.velocity,
          segmentId: track,
          // isKeyboardDown: true,
        };

        var ignore = false;
        if (event.subtype === "noteOn") {
          note.isKeyboardDown = true;

          // get rid of complicated notes
          if (prevNote && note.time - prevNote.time < 50 && note.segmentId === prevNote.segmentId) {
            ignore = true;
          }

          prevNote = note;
        } 

        if  (!ignore) {
          this.notes.push(note);

          if (!this.notesBySegmentId[track]) {
            this.notesBySegmentId[track] = {notes: []};
          }

          this.notesBySegmentId[track].notes.push(note);
        }
      } else {
        // todo: add instrument info
      }
    }
    this.smartDivide();
    this.smartSplit();
  },

  // TODO: move this to the game level
  smartDivide: function() {
    var debugSegment = {};

    // analyze each segment and see if we can divide it up further at appropriate points
    for (segmentId in this.notesBySegmentId) {
      var notes = this.notesBySegmentId[segmentId].notes;
      var GOOD_LENGTH = 80;
      var SAMPLE_LENGTH = 10;
      var currShift = ''; // TODO: remove this hack for offsetting the trackId because id may conflict


      if (notes.length > SAMPLE_LENGTH) {
        var averageLength = (notes[SAMPLE_LENGTH].time - notes[0].time) / SAMPLE_LENGTH;
      } else {
        continue;
      }

      var count = 0;
      for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        count++;

        if (!debugSegment[note.segmentId]) {
          debugSegment[note.segmentId] = []
        }
        debugSegment[note.segmentId].push(note);

        // If not too close to the end for a long note after a lengthy segment 
        if (i < notes.length - GOOD_LENGTH &&
            notes[i+1].time - note.time > 2 * averageLength && 
            count > GOOD_LENGTH) {

          notes[i].isEnd = true; // TODO: refactor. This is used when gamifying
          console.log(i);
          console.log(notes.length);
          console.log("===========");

          currShift += 's';
          count = 0;
        }
        // update segmentId everywhere
        note.segmentId += currShift;

        
      }
    }
  },

  smartSplit: function() {
    // Split any track that are too complicated into lower and upper tracks
  },

  smartShift: function() {
    // Find a shift that produces the least number of sharps
    var minNumBlackKeys = Infinity;
    var bestShift = 0;

    for (var j = 0; j < 12; j++) {
      numBlackKeys = 0;

      for (var i = 0; i < Math.min(this.notes.length, 200); i++) {
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
    Meteor.call('createTranslatedSong', this.notes, this.notesBySegmentId, function(err, songId) {
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
  for (var i = 0; i < Math.min(notes.length, 50); i++) {
    var note = notes[i].note;

    if (note + shift > 86) {
      diff++;
    } else if (note + shift < 49) {
      diff--;
    }
  }
  return diff;
}
