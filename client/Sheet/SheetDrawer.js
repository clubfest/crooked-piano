var BEATS_PER_LINE = 16;
var staveWidth = 300;

SheetDrawer = {
  init: function(notes) {
    var notes = [{
      timeInBeats: 0,
      durationInBeats: 2
    }, {
      timeInBeats: 2,
      durationInBeats: 2
    }, {
      timeInBeats: 4,
      durationInBeats: 2
    }, {
      timeInBeats: 4,
      durationInBeats: 4
    }
    ];

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

  setBeatsPerMeasure: function(numerator, denominator) {
    // TODO: get correct info
    numerator = numerator || 4;
    denominator = denominator || 4;
    this.beatsPerMeasure = 4 * numerator / denominator;
  },

  loadMeasures: function(numOfMeasures) {
    numOfMeasures = 4;

    var measures = [];
    var measure = [];
    var start = this.notes[this.cursorIndex].timeInBeats;

    for (var i = this.cursorIndex; i < this.notes.length; ) {
      var note = this.notes[i];

      if (note.timeInBeats - start < this.beatsPerMeasure) {
        measure.push(note);
        i++;

        if (i >= this.notes.length) {
          measures.push(measure);
        }
      } else {
        measures.push(measure);
        measure = [];
        start += this.beatsPerMeasure;

        if (measures.length > numOfMeasures) {
          break;
        }
      }
    }

    this.measures = measures;
  },

  loadVoices: function(measure) {
    var voices = [];

  },

  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  drawWestern: function() {
    var renderer = new Vex.Flow.Renderer(this.canvas,
      Vex.Flow.Renderer.Backends.CANVAS);
    this.context = renderer.getContext();
    this.clear();


    this.loadMeasures();

    for (var i = 0; i < this.measures.length; i++) {
      this.drawStave(i * staveWidth);
      var measure = this.measures[i];
      this.loadVoices(measure);
    }
    // this.staveCount = 0;
    // this.drawStave(); // a stave is the same as a measure
  },

  drawStave: function(xOffset) {
    // TODO: adjust position according to staveCount
    this.upperStave = new Vex.Flow.Stave(xOffset, 10, staveWidth);
    // this.upperStave.addClef("treble");

    // TODO: adjust and possibly remove; see if this can remove restriction
    // this.upperStave.addTimeSignature("4/4");
    this.upperStave.setContext(this.context).draw();

    // this is not really used except as a reference
    this.lowerStave = new Vex.Flow.Stave(xOffset, 70, staveWidth);
    // this.lowerStave.addClef("bass");
    // this.lowerStave.addTimeSignature("4/4");
    this.lowerStave.setContext(this.context).draw();

    // this.drawNotesToStave();
  },

  drawNotesToStave: function() {
    this.transferNotesToVoices();

    // if the stave is finished, move on to a new stave
  },

  transferNotesToVoices: function() {
    // if notes overlap unevenly, create a new voice with and rest padding
  },

  loadVoices: function(measure) {
    var staveNotes = [];
    for (var i = 0; i < measure.length; i++) {
      var note = measure[i];
      Array.prototype.push.apply(staveNotes, notesToStaveNotes([note]));
    }

    function create_4_4_voice() {
      return new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
        resolution: Vex.Flow.RESOLUTION
      });
    }

    // this.loadNextStaveNotes();

    // Create voices and add notes to each of them.
    var voice = create_4_4_voice().addTickables(staveNotes);
    var formatter = new Vex.Flow.Formatter().
      joinVoices([voice]).format([voice], staveWidth);
    voice.draw(this.context, this.upperStave);

  },

  loadNextStaveNotes: function() {
    // take into account previously overflowed notes
    if (!this.overflowedStaveNotes) {
      this.staveNotes = this.overflowedStaveNotes;
      this.overflowedStaveNotes = [];
      this.drawTies();
    }
    // update drawIndex

    // load overflowed notes
  },

  drawStaveNote: function() {

  },

  drawTies: function() {

  },

  hi: function() {
    var hasStave = false;
    var leftOverNotes = []; // splitted StaveNote from previous measure

    for (var i = 0; i < this.notes.length; i++) {
      // initialize
      if (!hasStave) {
        var stave = new Vex.Flow.Stave(0, 120 * staveIndex, this.canvas.width - 20)
        var beatsLeft = beatsPerMeasure;
        var staveNotes = [];
        hasStave = true;

        stave.setContext(this.context).draw();
      }

      if (this.notes[i].subtype === 'noteOn') {
        var currentBeat = this.notes[i].timeInBeats;
        var notesOnSameBeat = [this.notes[i]];

        // TODO: deal with notes with different durations
        for (var j = i + 1; j < this.notes.length; j++) {
          if (this.notes[j].subtype === 'noteOn' &&
              this.notes[j].timeInBeats === this.notes[i].timeInBeats) {
            notesOnSameBeat.push(this.notes[j]);
            i++;
            break ;
          }
        }

        // if (note.durationInBeats <= beatsLeft) {
        //   beatsLeft -= note.durationInBeats;

        //   staveNotes.push(new Vex.Flow.StaveNote({
        //     keys: ['c/5'],
        //   }));
        // }

        if (beatsLeft <= 0) {
          hasStave = false;
        }
      }
    }
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

  setNotes: function(notes) {
    this.notes = notes || [];
  },

  getLastNotes: function() {
    if (this.notes.length === 0) return [];

    // var lastNotesReversed = [];
    var lastBeat = this.notes[this.notes.length - 1].timeInBeats;

    for (var i = this.notes.length - 1;; i--) {
      if (lastBeat - this.notes[i].timeInBeats > BEATS_PER_LINE) {
        i++;
        break ;
      } else if (i === 0) {
        break ;
      }
    }
    return this.notes.slice(i);
  },
}

notesToStaveNotes = function(notes) {
  /* Input a set of notes that start and end at the same time */
  // assume the beats used has been rounded to the nearest sixteenths
  // TODO: tuplets
  var durationInBeats = notes[0].durationInBeats;

  var ret = [];

  var sixteenths = durationInBeats * 4;

  if (sixteenths !== Math.floor(sixteenths)){
    console.log('the note is not a multiple of sixteenths');
  }

  var exponent = Math.log(sixteenths) / Math.log(2); // whole -> 4, half -> 3, quarter -> 2


  var invertedDuration = Math.pow(2, Math.max(0, - Math.floor(exponent) + 4)); // 1, 2, 4, 8, 16

  ret.push(new Vex.Flow.StaveNote({
    keys: ["e/5"],
    duration: invertedDuration.toString(),
    // stemDirection: 'inverted',
  }));

  var remainder = sixteenths - 16 / invertedDuration;

  return ret;
}

noteNumberToVexNote = function(noteNumbers) {
  var accidentals = [];
  var keys = []
  for (var i = 0; i < noteNumbers.length; i++){
    var noteNumber = noteNumbers[i];
  }

  var octave = Math.ceil(noteNumber / 12) - 1;
  var roughNoteNumber = noteNumber % 12;

  var conversion = {
    0: 'C',
    1: 'C',
    2: 'D',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'F',
    7: 'G',
    8: 'G',
    9: 'A',
    10: 'A',
    11: 'B',
  };

  // var ret = new Vex.Flow.StaveNote({
    // conversion[roughNoteNumber];
}

// export for testing purposes
if (typeof module === 'undefined') module = {};
module.exports = SheetDrawer;


    // var notes = [
    //   // new Vex.Flow.StaveNote({ keys: ["e/5"], duration: "4", stem_direction: -1 }),
    //   // new Vex.Flow.StaveNote({ keys: ["e/5"], duration: "4", stem_direction: -1 }),
    //   new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4r"}),
    //   // new Vex.Flow.StaveNote({ keys: ["d/5"], duration: "hd" }).addDotToAll(),
    //   new Vex.Flow.StaveNote({ keys: ["c/4", "e/3", "g/3"], duration: "4" }),
    //   new Vex.Flow.StaveNote({ keys: ["c/4", "e/3", "g/3"], duration: "4" }),
    //   new Vex.Flow.StaveNote({ keys: ["c/4", "e/3", "g/3"], duration: "4" }),
    //   // new Vex.Flow.StaveNote({ keys: ["c/4", "e/3", "g/3"], duration: "4" }),
    //   // new Vex.Flow.StaveNote({ keys: ["c/4", "e/3", "g/3"], duration: "4" }),
    // ];

    // // var tuplet = new Vex.Flow.Tuplet(notes.slice(0,3), {beats_occupied: 1});

    // // Create a second voice, with just one whole note
    // var notes2 = [
    //   new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "1" })
    // ];

    // // Create a voice in 4/4
    // function create_4_4_voice() {
    //   return new Vex.Flow.Voice({
    //     num_beats: 4,
    //     beat_value: 4,
    //     resolution: Vex.Flow.RESOLUTION
    //   });
    // }

    // // Create voices and add notes to each of them.
    // var voice = create_4_4_voice().addTickables(notes);
    // var voice2 = create_4_4_voice().addTickables(notes2);

    // // Format and justify the notes to 500 pixels
    // var formatter = new Vex.Flow.Formatter().
    //   joinVoices([voice, voice2]).format([voice, voice2], this.canvas.width - 20);

    // // Render voice
    // voice.draw(ctx, stave);
    // voice2.draw(ctx, stave);
    // // tuplet.setContext(ctx).draw();