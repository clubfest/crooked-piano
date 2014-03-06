
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
  '/MIDI.js/js/Window/DOMLoader.script.js',
  '/MIDI.js/inc/Base64.js',
  '/MIDI.js/inc/base64binary.js',
];

loadMidiJs = function() {
  var numDone = 0;

  Session.set('loadProgress', 0);

  $.each(files, function(idx, file) {
    $.getScript(file, function() {
      numDone++;
      Session.set('loadProgress', Session.get('loadProgress') + 1);
      if (numDone === files.length) {
        loadSound();
      }
    })
  });
}

loadSound = function() {
  Session.set('hasMidiNoteOn', false);
  MIDI.loadPlugin({
    soundfontUrl: "/MIDI.js/soundfont/",
    instrument: "acoustic_grand_piano",
    callback: function() {
      Session.set('hasMidiNoteOn', true);

      $(window).off('keyboardDown.sound');
      $(window).on('keyboardDown.sound', function(evt, data) {
          if (typeof data.note !== 'undefined') {
            data.channel = data.channel || 0;
            MIDI.noteOn(data.channel, data.note, damp(data.velocity, data.note)  );
          }
      });
      // TODO: keyboardUp.sound if without pedal
    }

  });
}

function damp(velocity, note) {
  return velocity * note / 60;
}
