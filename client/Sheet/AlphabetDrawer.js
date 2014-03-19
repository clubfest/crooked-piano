var BEATS_PER_LINE = 16;
var staveWidth = 300;

AlphabetDrawer = {
  init: function(notes) {
    var notes = [{
      timeInBeats: 0,
      durationInBeats: 1,
      subtype: 'noteOn',
    }, {
      timeInBeats: 1,
      durationInBeats: 1,
      subtype: 'noteOn',
    }, {
      timeInBeats: 2,
      durationInBeats: 2,
      subtype: 'noteOn',
    }, {
      timeInBeats: 3,
      durationInBeats: 2,
      subtype: 'noteOn',
    }];

    this.initVariables(notes);
    this.initCanvas();
  },

  initVariables: function(notes) {
    this.setBeatsPerMeasure();
    this.cursorIndex = 0;
    this.notes = notes || [];
  },

  initCanvas: function() {
    this.canvas = document.getElementById('sheet-canvas');
    this.canvas.height = 600;
    this.canvas.width = Math.min(700, $(this.canvas).parent().width());    
  },

  // Note: use this if time signature changes
  setBeatsPerMeasure: function(numerator, denominator) {
    this.numerator = numerator || 4;
    this.denominator = denominator || 4;
    this.beatsPerMeasure = 4 * this.numerator / this.denominator;
  },

  
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  // TODO: rename to drawAlphabet
  draw: function() {
    this.context = this.canvas.getContext('2d');
    this.context.fillStyle = 'rgb(0, 0, 0)'; // black

    this.clear();

    // todo: make this dynamic
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

    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      if (note.subtype === 'noteOn') {
        var firstBeat = notes[i].timeInBeats;
        break ;
      }
    }

    for (var i = notes.length - 1; i >= 0; i--) {
      var note = notes[i];
      if (note.subtype === 'noteOff') {
        var lastBeat = notes[i].timeInBeats;
        break ;
      }
    }

    // TODO: make this simpler, have the current beat based at the center
    // currently, it is at the end.
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
      if (note.subtype === 'noteOn') {
        this.context.fillText(
          noteToName(note.noteNumber, true) + (note.durationInBeats * 8), // text
          (note.timeInBeats - firstBeat) * 50, // x-coord
          (maxNote - note.noteNumber) * noteHeight  // y-coord
        ); 
      }        
    }

  },
}