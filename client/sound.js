
Meteor.startup(function() {
  loadMidiJs();
});

Handlebars.registerHelper('hasMidiNoteOn', function() {
  return Session.get('hasMidiNoteOn');
});

Handlebars.registerHelper('hasSoundFiles', function() {
  return Session.get('loadProgress') === files.length;
});

var files = [
  '/MIDI.js/inc/jasmid/replayer.js',
  '/MIDI.js/inc/jasmid/midifile.js',
  '/MIDI.js/inc/jasmid/stream.js',
  '/MIDI.js/js/MIDI/AudioDetect.js',
  '/MIDI.js/js/MIDI/LoadPlugin.js',
  '/MIDI.js/js/MIDI/Plugin.js',
  '/MIDI.js/js/MIDI/Player.js',
  '/MIDI.js/js/Window/DOMLoader.XMLHttp.js',
  '/MIDI.js/inc/Base64.js',
  '/MIDI.js/inc/base64binary.js',
];

NUM_FILES = files.length;

loadMidiJs = function() {
  var numDone = 0;

  Session.set('loadProgress', 0);

  $.each(files, function(idx, file) {
    $.getScript(file, function() {
      numDone++;
      Session.set('loadProgress', Session.get('loadProgress') + 1);
      if (numDone === NUM_FILES) {
        loadSound();
      }
    })
  });
}

DEFAULT_CHANNEL = 0;
DRUM_CHANNEL = 9;
var SYNTH_DRUM_NUMBER = 118;
var ELECTRIC_GUITAR_PROGRAM_NUMBER = 27;
var BASS_PROGRAM_NUMBER = 33;
var VIOLIN_PROGRAM_NUMBER = 40;
// var STRING_ENSEMBLE_1_PROGRAM_NUMBER = 48;

loadSound = function() {
  Session.set('hasMidiNoteOn', false);
  MIDI.loadPlugin({
    soundfontUrl: "/MIDI.js/soundfont/",
    instruments: ["acoustic_grand_piano", "synth_drum"],
    // "electric_bass_finger", "violin"],
    // instrument: "acoustic_grand_piano",
    callback: function() {
      Session.set('hasMidiNoteOn', true);
      MIDI.programChange(DRUM_CHANNEL, SYNTH_DRUM_NUMBER);
      // MIDI.programChange(0, VIOLIN_PROGRAM_NUMBER);
      // MIDI.programChange(2, ELECTRIC_GUITAR_PROGRAM_NUMBER);
      // MIDI.programChange(1, BASS_PROGRAM_NUMBER);
      // MIDI.programChange(8, ELECTRIC_GUITAR_JAZZ_NUMBER);

      $(window).off('keyboardDown.sound');
      $(window).on('keyboardDown.sound', function(evt, data) {
          if (typeof data.noteNumber !== 'undefined') {
            data.channel = data.channel || DEFAULT_CHANNEL;
            // MIDI.noteOn(DRUM_CHANNEL, data.note, data.velocity);
            MIDI.noteOn(data.channel, data.noteNumber, damp(data.velocity, data.noteNumber));
          }
      });

      $(window).off('keyboardUp.sound');
      $(window).on('keyboardUp.sound', function(evt, data) {
          if (typeof data.noteNumber !== 'undefined' /*&& !data.pedalOn*/) {
            data.channel = data.channel || 0;
            MIDI.noteOff(data.channel, data.noteNumber);
          }
      });
    }

  });
}

function damp(velocity, note) {
  return velocity * note / 70;
  return velocity;
}
