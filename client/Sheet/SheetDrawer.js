var BEATS_PER_LINE = 16;
var staveWidth = 300;

SheetDrawer = {
  init: function(notes) {
    var notes = [{
      timeInBeats: 0,
      noteNumber: 60,
      durationInBeats: 1,
      subtype: 'noteOn',
    }, {
      timeInBeats: 1,
      durationInBeats: 1,
      noteNumber: 60,
      subtype: 'noteOn',
    }, {
      timeInBeats: 2,
      durationInBeats: 2,
      noteNumber: 64,
      subtype: 'noteOn',
    }, {
      timeInBeats: 3,
      durationInBeats: 2,
      noteNumber: 44,
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

  drawWestern: function() {
    var renderer = new Vex.Flow.Renderer(this.canvas,
      Vex.Flow.Renderer.Backends.CANVAS);
    this.context = renderer.getContext();
    this.clear();


    this.loadMeasures();
    // everything will be added to each measure
    this.addNotesToVoicesToMeasures();
    this.computeVoiceAverage();
    this.addRestsToVoices();
    this.translateToVex();
    this.drawStaveNotes();
    //  TODO: find the measures to draw and compute the offset
    // this.drawStaveAndVoices();

    // for (var i = 0; i < this.measures.length; i++) {
    //   this.drawStave(i * staveWidth);

    //   this.drawVoices(measure);
    // }
    // console.log(this.measures);

    // this.staveCount = 0;
    // this.drawStave(); // a stave is the same as a measure
  },

  computeVoiceAverage: function() {
    for (var k = 0; k < this.measures.length; k++) {
      var measure = this.measures[k];
      for (var i = 0; i < measure.voices.length; i++) {
        var voice = measure.voices[i];
        var noteNumberTotal = 0;
        var numNotes = 0;
        for (var j = 0; j < voice.length; j++) {
          var note = voice[j];
          if (note.subtype === 'noteOn') {
            noteNumberTotal += note.noteNumber;
            numNotes++;
          }
        }
        if (numNotes > 0) {
          voice.averageNoteNumber = noteNumberTotal / numNotes;
        } else {
          voice.averageNoteNumber = 70; // todo: use neighboring voice
        }
      }
    }

  },

  drawStaveNotes: function() {
    for (var k = 0; k < this.measures.length; k++) {
      var measure = this.measures[k];
      var currentStave = this.drawStave(k * staveWidth);

      var vexVoices = [];
      for (var i = 0; i < measure.voices.length; i++) {
        var voice = measure.voices[i];

        vexVoices.push((new Vex.Flow.Voice({
          num_beats: 4,
          beat_value: 4,
          resolution: Vex.Flow.RESOLUTION
        })).addTickables(voice.staveNotes));
      }
      var formatter = new Vex.Flow.Formatter().joinVoices(vexVoices).format(vexVoices, staveWidth);
      for (var i = 0; i < vexVoices.length; i++) {
        vexVoices[i].draw(this.context, currentStave);
      }
    }
  },

  translateToVex: function() {
    for (var k = 0; k < this.measures.length; k++) {
      var measure = this.measures[k];
      for (var i = 0; i < measure.voices.length; i++) {
        var voice = measure.voices[i];
        var currentBeat = measure.startBeat;

        var bunches = [[]];

        for (var j = 0; j < voice.length; j++) {
          var note = voice[j];
          var lastBunch = bunches[bunches.length - 1];
          if (lastBunch.length === 0) {
            lastBunch.push(note);
          } else{
            var previousNote = lastBunch[lastBunch.length - 1];
            if (previousNote.timeInBeats === note.timeInBeats) {
              // we know the durations have to be the same by definition of voice
              bunch.push(note);
            } else {
              bunches.push([note]);
            }
          }
        }

        voice.staveNotes = [];
        for (var j = 0; j < bunches.length; j++){
          var bunch = bunches[j];
          Array.prototype.push.apply(voice.staveNotes, notesToStaveNotes(bunch, voice.averageNoteNumber));
        }

      }
    }
  },

  addNotesToVoicesToMeasures: function() {
    // a voice is an intermediate representation
    // where every spot is occupied by a note or rest note 
    // an array of a bunch of notes with annotations:
    // id, rest, tie, vex representation

    for (var k = 0; k < this.measures.length; k++) {
      var measure = this.measures[k];

      var voices = [[]];
      for (var i = 0; i < measure.notes.length; i++) {
        var note = measure.notes[i];
        var voiceFound = false;

        for (var voiceIdx = 0; voiceIdx < voices.length; voiceIdx++) {
          var voice = voices[voiceIdx];

          if (voice.length === 0) {
            voice.push(note);
            voiceFound = true;
            break;
          }

          var previousNote = voice[voice.length - 1];

          if (note.timeInBeats === previousNote.timeInBeats
              && note.durationInBeats === previousNote.durationInBeats) {
            voice.push(note);
            voiceFound = true;
            break;
          }

          if (note.timeInBeats >= previousNote.timeInBeats + previousNote.durationInBeats) {
            voice.push(note);
            voiceFound = true;
            break;
          }
        }

        if (!voiceFound) {
          // create a new voice
          voices.push([note]);
        }
      }

      measure.voices = voices;
    }
  },

  loadStaveNoteToNote: function() {
    // generate the Vex.StaveNote and store it inside the note in all the voices
    // because we may need to put a tie in somewhere
    // and put it in a container for drawing
  },

  addRestsToVoices: function() {
    for (var k = 0; k < this.measures.length; k++) {
      var measure = this.measures[k];
      for (var i = 0; i < measure.voices.length; i++) {
        var voice = measure.voices[i];
        var voiceWithRest = clone(voice);

        var currentBeat = measure.startBeat;

        for (var j = 0; j < voice.length; j++) {
          var note = voice[j];
          var gap = note.timeInBeats - currentBeat;
          if (gap > 0) {
            voiceWithRest.splice(j, 0, {subtype: 'rest', timeInBeats: currentBeat, durationInBeats: gap});
          }
          currentBeat = note.timeInBeats + note.durationInBeats;
        }

        // take care of the end
        gap = measure.startBeat + measure.beatsPerMeasure - currentBeat;
        if (gap > 0) {
          voiceWithRest.splice(j, 0, {subtype: 'rest', timeInBeats: currentBeat, durationInBeats: gap});
        }
        measure.voices[i] = voiceWithRest;
      }
    }
  },

  getStartBeat: function() {
    // todo: deal with pieces that change time signature
    // todo: use measureInfo to store startBeat, endBeat and keySignature info
    // need 2 measures before current 1, the first of which will cushion wrong start notes

    return Math.floor(this.notes[this.cursorIndex].timeInBeats / this.beatsPerMeasure) * this.beatsPerMeasure;
  },


  loadMeasures: function(numOfMeasures) {
    // measure is a sequence of ANNOTATED notes.
    // For each note that overflows, we will add a new note
    // in the next measure,
    // and annotate each note's id inside the other via
    // the attribute tiedTo and tiedFrom.
    this.measures = [];
    var idIndex = 0; // for creating id for each note
    var startBeat = 0;
    var measure = {
      notes: [], 
      numerator: this.numerator, // needed for creating Vex.Voice 
      denominator: this.denominator,
      beatsPerMeasure: 4 * this.numerator / this.denominator,
      startBeat: startBeat,
    };

    // load unmodified notes in the right measure given usng the key signature
    for (var i = 0; i < this.notes.length; i++) {
      var note = this.notes[i];

      if (note.subtype === 'keySignature') {
        // TODO: obtain the keySignature events from the midi and merge it into the notes
        // TODO: update measure's endBeat
        // setBeatsPerMeasure
      } else if (note.subtype === 'noteOn') {
        note.id = idIndex++; // id annotation is needed when we draw ties later

        if (note.timeInBeats >= startBeat + this.beatsPerMeasure) {
          this.measures.push(measure);
          startBeat += this.beatsPerMeasure;
          measure = {
            notes: [],
            numerator: this.numerator,
            denominator: this.denominator,
            beatsPerMeasure: 4 * this.numerator / this.denominator,
            startBeat: startBeat,
          };
        }

        measure.notes.push(note);

        if (i === this.notes.length - 1) {
          this.measures.push(measure);
        }
      }
    }

    // splitting notes; this.measures.length can increase indefinitely,
    // depending on how long the final note is
    for (var i = 0; i < this.measures.length; i++) {
      var measure = this.measures[i];

      for (var j = 0; j < measure.notes.length; j++) {
        var note = measure.notes[j];
        var beatsPerMeasure = 4 * measure.numerator / measure.denominator;
        var overBy = note.timeInBeats + note.durationInBeats - (measure.startBeat + beatsPerMeasure);

        if (overBy > 0) {
          if (i === this.measures.length - 1) {
            this.measures.push({
              notes: [],
              numerator: measure.numerator,
              denominator: measure.denominator,
              beatsPerMeasure: 4 * measure.numerator / measure.denominator,
              startBeat: measure.startBeat + beatsPerMeasure,
            });
          }

          var nextMeasure = this.measures[i+1];
          var newNote = clone(note);
          newNote.id = idIndex++;
          newNote.timeInBeats = startBeat + this.beatsPerMeasure;
          newNote.durationInBeats = overBy;
          newNote.tiedFrom = note.id;
          nextMeasure.notes.splice(0,0, newNote);

          note.durationInBeats -= overBy;
          note.tiedTo = newNote.id;
        }
      }
    }
  },

  drawTies: function() {

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

  drawStave: function(xOffset) {
    // TODO: adjust position according to staveCount
    var upperStave = new Vex.Flow.Stave(xOffset, 10, staveWidth);
    // this.upperStave.addClef("treble");
    // this.upperStave.addTimeSignature("4/4");
    upperStave.setContext(this.context).draw();

    // this is not really used except as a reference
    var lowerStave = new Vex.Flow.Stave(xOffset, 70, staveWidth);
    // this.lowerStave.addClef("bass");
    // this.lowerStave.addTimeSignature("4/4");
    lowerStave.setContext(this.context).draw();

    return upperStave;
  },
}

function notesToStaveNotes(notes, averageNoteNumber) {
  /* 
    Input a set of notes that start and end at the same time
    Output an array of StaveNote, with correct keys and duration value and ties
    Only works for duration that is a multiple of the given unit, 16
  */

  var keys = []; // in Vex notation
  var accidentals = [];
  var isRest = false;

  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];
    if (note.subtype === 'rest') {
      isRest = true;
      keys.push(noteNumberToLetterWithoutAccidental(averageNoteNumber || 70)); // TODO: use previous note
      accidentals.push(false);
    } else {
      keys.push(noteNumberToLetterWithoutAccidental(note.noteNumber));
      accidentals.push(noteNumberHasAccidental(note.noteNumber));
    }
  }

  var ret = [];
  var unit = 16; // this would work if we use a different power of 2
  var durationInBeats = notes[0].durationInBeats;

  var durationLeft = durationInBeats / 4 * unit;

  while (durationLeft > 0) {
    // 16 (whole) -> 4, 8 -> 3, 4 -> 2, 2 -> 1, 1 -> 0. Non-integer is bad
    var exponent = Math.log(durationLeft) / Math.log(2); 

    // [4, infinity) -> 1, [3, 4) -> 2, [2, 3) -> 4, [1,2) ->  8, [0, 1) -> 16
    var invertedDuration = Math.pow(2, Math.max(-4, - Math.floor(exponent))) * unit;  
    var durationString = invertedDuration.toString();
    if (isRest) durationString += 'r';

    var staveNote = new Vex.Flow.StaveNote({
      keys: keys,
      duration: durationString,
    });

    // todo: add accidentals
    if (ret.length > 0) {
      // todo: add ties
    }

    ret.push(staveNote);
    durationLeft -= unit / invertedDuration;
  } 
  return ret;
}

function noteNumberToLetterWithoutAccidental(noteNumber, isFlat) {
  var octave = Math.ceil(noteNumber / 12) - 1;

  if (isFlat) {
    var conversion = {
      0: 'c',
      1: 'd',
      2: 'd',
      3: 'e',
      4: 'e',
      5: 'f',
      6: 'g',
      7: 'g',
      8: 'a',
      9: 'a',
      10: 'b',
      11: 'b',
    };
  } else {
    var conversion = {
      0: 'c',
      1: 'c',
      2: 'd',
      3: 'd',
      4: 'e',
      5: 'f',
      6: 'f',
      7: 'g',
      8: 'g',
      9: 'a',
      10: 'a',
      11: 'b',
    };
  }
  return conversion[noteNumber % 12] + '/' + octave;
}

function noteNumberHasAccidental(noteNumber) {
  var accidentalNotes = {
    0: false,
    1: true,
    2: false,
    3: true,
    4: false,
    5: false,
    6: true,
    7: false,
    8: true,
    9: false,
    10: true,
    11: false,
  }
  return accidentalNotes[noteNumber % 12];
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


      // separateAndLoadVoices: function(measure) {
  //   var staveNotesByVoice = []; // array of array of notes
  //   var voices = [];

  //   for (var i = 0; i < measure.length; ) {
  //     var note = measure[i];
  //     var currentTime = note.timeInBeats;

  //     for (j = i + 1; ; j++) {
  //       var nextNote = measure[j];
  //       if (note.timeInBeats === nextNote.timeInBeats &&
  //           note.durationInBeats === nextNote.durationInBeats) {
  //         // same voice
  //       } else if (nextNote.timeInBeats < note.timeInBeats + note.durationInBeats) {
  //         // different voice; decide which voice to go in
  //       } else {
  //         i = j;
  //         break ;
  //       }
  //       if (j >= measure.length) {
  //         i = j;
  //         break;
  //       }
  //     }

  //     Array.prototype.push.apply(staveNotes, notesToStaveNotes([note]));
  //   }

  //   var voice = (new Vex.Flow.Voice({
  //     num_beats: 4,
  //     beat_value: 4,
  //     resolution: Vex.Flow.RESOLUTION
  //   })).addTickables(staveNotes);
  // },