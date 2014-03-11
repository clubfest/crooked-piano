var BEATS_PER_LINE = 16;

SheetDrawer = {
  init: function() {
    this.canvas = document.getElementById('sheet-canvas');
    this.canvas.height = 300;
    this.canvas.width = 700;
    this.beatsPerMeasure = 8;

    this.context = this.canvas.getContext('2d');
    // this.context.font = 'italic 16px Calibri';
    this.context.fillStyle = 'rgb(0, 0, 0)'; // black

    this.notes = [];
  },

  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  draw: function() {
    this.clear();
    var maxNote = 86;
    var minNote = 47;
    var noteHeight = this.canvas.height / (maxNote - minNote + 1);

    // horizontal line
    this.context.beginPath();
    this.context.moveTo(0, (maxNote - 60) * noteHeight);
    this.context.lineTo(this.canvas.width, (maxNote - 60) * noteHeight);
    this.context.stroke();

    notes = this.getLastNotes();

    this.context.font = 'italic 18px Calibri';
    // this.context.font = '16px';

    if (notes.length === 0) return ;

    var firstBeat = notes[0].beat;
    var lastBeat = notes[notes.length - 1].beat;
    var shift = BEATS_PER_LINE - (lastBeat - firstBeat);

    // determine the starting vertical lines
    for (var i = 0; i < BEATS_PER_LINE; i++) {
      if ((i + firstBeat) % this.beatsPerMeasure === 0) {
        break ;
      }
    }

    for (; ; i += this.beatsPerMeasure) {
      if (i + shift >= BEATS_PER_LINE + this.beatsPerMeasure) break ;

      this.context.moveTo((i + shift) * 30, 0);
      this.context.lineTo((i + shift) * 30, this.canvas.height);
      this.context.stroke();
    }
      

    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      var beat = note.beat - firstBeat;
      this.context.fillText(
        noteToName(note.note, true) + note.duration, // text
        (beat + shift) * 30, // x-coord
        (maxNote - note.note) * noteHeight  // y-coord
      )
    }

  },

  setNotes: function(notes) {
    this.notes = notes;
  },

  getLastNotes: function() {
    if (this.notes.length === 0) return [];

    // var lastNotesReversed = [];
    var lastBeat = this.notes[this.notes.length - 1].beat;

    for (var i = this.notes.length - 1;; i--) {
      if (lastBeat - this.notes[i].beat > BEATS_PER_LINE) {
        i++;
        break ;
      } else if (i === 0) {
        break ;
      }
    }
    return this.notes.slice(i);
  },
}


// function computeMaxNote(notes) {
//   var currMax = 0; // the lowest midi note 
//   for (var i = 0; i < notes.length; i++) {
//     var note = notes[i];
//     if (note.note > currMax) {
//       currMax = note.note;
//     }
//   }
//   return currMax;
// }

// function computeMinNote(notes) {
//   var currMin = 127; // the highest midi note 
//   for (var i = 0; i < notes.length; i++) {
//     var note = notes[i];
//     if (note.note < currMin) {
//       currMin = note.note;
//     }
//   }
//   return currMin;
// }