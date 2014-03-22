// Warning: denominator does not conform to midi's definition
// it must be converted via Math.log(denominator || 2) / Math.log(2)

BEATS_PER_LINE = 16; // used in LyricsDisplay
var staveWidth = 300;
var xStretchFactor = 60;
var animationInMicroseconds = 100000;

AlphabetSheetDrawer = {
  init: function(song) {
    this.initVariables(song);
    this.initCanvas();
  },

  initVariables: function(song) {
    this.setBeatsPerMeasure();
    this.notes = song.notes || [];

    var self = this;
  },

  initCanvas: function() {
    this.canvas = document.getElementById('sheet-canvas');
    this.canvas.height = 600;
    this.canvas.width = $(this.canvas).parent().width();    

    this.context = this.canvas.getContext('2d');
    this.context.font = 'italic 18px Calibri';
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

  // reset: function() {
  //   this.timeSignatureIndex = 0;
  // },

  // TODO: rename to drawAlphabet
  draw: function() {
    if (this.notes.length === 0) return ;

    // todo: make this dynamic
    this.maxNote = 86;
    this.minNote = 47;
    this.noteHeight = this.canvas.height / (this.maxNote - this.minNote + 1);      


    var firstBeat = this.notes[Session.get('replayerIndex')].startTimeInBeats;
    this.microsecondsSinceLastDrawn = 0;


    // TODO: make this simpler, have the current beat based at the center
    // currently, it is at the end.
    // var shift = BEATS_PER_LINE - (lastBeat - firstBeat);      

    // draw notes
    shiftInBeats = 0;
    if (typeof this.redrawTimeoutId !== "undefined") {
      window.clearTimeout(this.redrawTimeoutId);
    }

    this.drawAndRedraw(firstBeat, shiftInBeats);
  },

  drawAndRedraw: function(firstBeat, shiftInBeats) {
    this.clear();

    var replayerIndex = Session.get('replayerIndex');
    // notes
    for (var i = replayerIndex; i < this.notes.length; i++) {
      var note = this.notes[i];
      if (note.startTimeInBeats - firstBeat > 16) {
        break;
      }

      if (note.subtype === 'noteOn') {
        var startX = (note.startTimeInBeats - firstBeat - shiftInBeats) * xStretchFactor;
        var startY = (this.maxNote - note.noteNumber) * this.noteHeight;
        var endX = (note.endTimeInBeats - firstBeat - shiftInBeats) * xStretchFactor;
        var noteName = noteToName(note.noteNumber, false);

        this.context.fillText(noteName, startX, startY);

        // draw duration
        this.context.beginPath();
        this.context.moveTo(startX, startY + 2); // 2 is for padding
        this.context.lineTo(endX, startY + 2);
        this.context.lineWidth = .8;
        this.context.strokeStyle = 'black';
        this.context.stroke();

      } 
    }

    // vertical lines; 
    var timeSignatures = MidiReplayer.timeSignatures;
    var timeSignature = {numerator: 4, denominator: 4, startTimeInBeats: 0};
    var signatureIndex = null;

    for (var i = 0; i < timeSignatures.length; i++) {
      if (timeSignatures[i].startTimeInBeats > firstBeat) {
        break;
      } else {
        timeSignature = timeSignatures[i];
        signatureIndex = i;
      }
    }

    beatValue = 4 / timeSignature.denominator;
    beatsPerMeasure = timeSignature.numerator * beatValue;
    timeSignatureBeat = timeSignature.startTimeInBeats;

    var beat = timeSignature.startTimeInBeats;

    for ( ; ; beat += beatsPerMeasure) {
      if (beat > firstBeat) {
        beat -= beatsPerMeasure;
        break;
      }
    }

    for (; beat < firstBeat + BEATS_PER_LINE; ) {
      if ((beat - timeSignatureBeat) % beatsPerMeasure === 0) {
        this.context.beginPath();

        this.context.moveTo((beat - firstBeat - shiftInBeats) * xStretchFactor, 0);
        this.context.lineTo((beat - firstBeat - shiftInBeats) * xStretchFactor, this.canvas.height);
        this.context.strokeStyle = 'rgb(50, 50, 50)'; // dark grey
        this.context.lineWidth = .8;
        this.context.stroke();
      } else {
        this.context.beginPath();

        this.context.moveTo((beat - firstBeat - shiftInBeats) * xStretchFactor, 0);
        this.context.lineTo((beat - firstBeat - shiftInBeats) * xStretchFactor, this.canvas.height);
        this.context.strokeStyle = 'rgb(150, 150, 150)'; // grey
        this.context.lineWidth = .4;
        this.context.stroke();
      }

      var changed = false;
      if (signatureIndex === null) {
        var i = 0;
      } else {
        var i = signatureIndex + 1;
      }

      for (; i < timeSignatures.length; i++) {
        var newTimeSignature = timeSignatures[i];
        if (newTimeSignature.startTimeInBeats > beat) {
          break;
        } else {
          timeSignature = newTimeSignature;
          signatureIndex = i;
          changed = true;
        }
      }

      if (changed) {
        beatValue = 4 / timeSignature.denominator;
        beatsPerMeasure = timeSignature.numerator * beatValue;
        timeSignatureBeat = timeSignature.startTimeInBeats;
        beat = timeSignatureBeat;
      } else {
        beat += beatValue;
      }
    }

    // horizontal lines
    for (var noteNumber = this.minNote; noteNumber < this.maxNote; noteNumber++) {
      this.context.beginPath();
      this.context.strokeStyle = 'black';
      this.context.lineWidth = .3;

      if (noteNumber % 12 === 0) {
        this.context.moveTo(0, (this.maxNote - noteNumber) * this.noteHeight);
        this.context.lineTo(this.canvas.width, (this.maxNote - noteNumber) * this.noteHeight);
        this.context.stroke();
      }
    }

    if (Session.get('isReplaying')) {
      this.microsecondsSinceLastDrawn += animationInMicroseconds;
      shiftInBeats = this.microsecondsSinceLastDrawn / MidiReplayer.microsecondsPerBeat;

      var self = this;
      this.redrawTimeoutId = window.setTimeout(function() {
        self.drawAndRedraw(firstBeat, shiftInBeats);
      }, animationInMicroseconds / 1000);
    }
  },
}
