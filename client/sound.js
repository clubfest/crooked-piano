
Meteor.startup(function() {
  loadMidiJs();
});

Handlebars.registerHelper('hasMidiNoteOn', function() {
  return Session.get('hasMidiNoteOn');
});


function loadMidiJs() {
  var numDone = 0;
  var files = [
    '/MIDI.js/js/MIDI/AudioDetect.js',
    '/MIDI.js/js/MIDI/LoadPlugin.js',
    '/MIDI.js/js/MIDI/Plugin.js',
    '/MIDI.js/js/MIDI/Player.js',
    '/MIDI.js/js/Window/DOMLoader.XMLHttp.js',
    '/MIDI.js/js/Window/DOMLoader.script.js',
    '/MIDI.js/inc/Base64.js',
    '/MIDI.js/inc/base64binary.js',
  ]

  $.each(files, function(idx, file) {
    $.getScript(file, function() {
      numDone++;

      if (numDone === files.length) {
        MIDI.loadPlugin({
          soundfontUrl: "/MIDI.js/soundfont/",
          instrument: "acoustic_grand_piano",
          callback: function() {
            Session.set('hasMidiNoteOn', true);
            console.log('sound is ready');

            $(window).on('keyboardDown.sound', function(evt, data) {
                if (typeof data.note !== 'undefined') {
                  data.channel = data.channel || 0;
                  MIDI.noteOn(data.channel, data.note, data.velocity);
                }
            });
            // TODO: keyboardUp.sound if without pedal
          }
        });
      }
    })
  });
}
