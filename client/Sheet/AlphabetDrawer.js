var BEATS_PER_LINE = 16;
var staveWidth = 300;
var xStretchFactor = 60;
var animationInMicroseconds = 50000;

AlphabetSheetDrawer = {
  init: function(song) {
    this.initVariables(song);
    this.initCanvas();
  },

  initVariables: function(song) {
    this.setBeatsPerMeasure();
    this.notes = song.notes || [];

    var self = this;
    // $(window).on('tempoChanged.alphabetDrawer', function(evt, data) {
    //   console.log('tempoChanged')
    //   self.microsecondsPerBeat = data.microsecondsPerBeat;
    // });
  },

  initCanvas: function() {
    this.canvas = document.getElementById('sheet-canvas');
    this.canvas.height = 600;
    this.canvas.width = Math.min(700, $(this.canvas).parent().width());    

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

    // vertical lines
    for (var beat = Math.floor(firstBeat); beat < firstBeat + BEATS_PER_LINE; beat++) {
      if ((beat) % this.beatsPerMeasure === 0) {
        this.context.beginPath();

        this.context.moveTo((beat - firstBeat - shiftInBeats) * xStretchFactor, 0);
        this.context.lineTo((beat - firstBeat - shiftInBeats) * xStretchFactor, this.canvas.height);
        this.context.strokeStyle = 'rgb(50, 50, 50)';
        this.context.lineWidth = .8;
        this.context.stroke();
      } else {
        this.context.beginPath();

        this.context.moveTo((beat - firstBeat - shiftInBeats) * xStretchFactor, 0);
        this.context.lineTo((beat - firstBeat - shiftInBeats) * xStretchFactor, this.canvas.height);
        this.context.strokeStyle = 'rgb(150, 150, 150)';
        this.context.lineWidth = .4;
        this.context.stroke();
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
      shift = this.microsecondsSinceLastDrawn / MidiReplayer.microsecondsPerBeat;

      var self = this;
      this.redrawTimeoutId = window.setTimeout(function() {
        self.drawAndRedraw(firstBeat, shift);
      }, animationInMicroseconds / 1000);
    }
  },
}

function toTwoDecimalPlaces(num) {
  return Math.floor(num * 100)/100;
}

// this is quite buggy
function toFraction(num) {
  var ret = "";

  if (Math.floor(num) > 0) {
    ret += Math.floor(num);
  }

  var remainder = num - Math.floor(num);
  var fraction = getNumeratorAndDenominator(roundUp(remainder), [1,2,3,4]);

  if (fraction !== null) {
    return ret += fractionToCodePoint(fraction);
  } else {
    return num;
  }

}

function roundUp(beat, multipliers) { 
 var attempts = [];

  var multipliers = multipliers || [3, 4]; // for finer, use [6, 8]
  for (var i = 0; i < multipliers.length; i++) {
    var multiplier = multipliers[i];
    attempts.push(ceiling(multiplier * beat) / multiplier);
  }

  var minChange;
  var minIndex;

  for (var i = 0; i < attempts.length; i++) {
    if (!minChange || attempts[i] - beat < minChange) {
      minChange = attempts[i] - beat;
      minIndex = i;
    }
  }

  return attempts[minIndex];
}

function getNumeratorAndDenominator(num, multipliers) {
  for (var i = 0; i < multipliers.length; i++) {
    var multiplier = multipliers[i];
    var numerator = num * multiplier;
    if (numerator === Math.floor(numerator)) {
      return {numerator: numerator, denominator: multiplier};
    }
  }

  return null;
}

function ceiling(num) {
  // Like a ceiling function but not in extreme case like 2.09
  var remainder = num - Math.floor(num);
  if (remainder > .1) {
    return Math.ceil(num);
  } else {
    return Math.floor(num);
  }
}

function fractionToCodePoint(fraction) {
  if (fraction.denominator === 2 && fraction.numerator === 1) {
    return '\u00bd';
  } else if (fraction.denominator === 3) {
    if (fraction.numerator === 1) {
      return '\u2153';
    }
  } else if (fraction.denominator === 4) {
    if (fraction.numerator === 1) {
      return '\u00bc';
    } else if (fraction.numerator === 3) {
      return '\u00be';
    }
  } else if (fraction.denominator === 1 && fraction.numerator === 1) {
    return '1';
  } else {
    return fraction.numerator + '\u2044' + fraction.denominator;
  }
}