var displayModes = ['infoTab', 'soundTab'];
var playModes = ['practice', 'demo', 'pause'];

Template.midiReplayer.isReplaying = function() {
  return Session.get('isReplaying');
}

Template.midiReplayer.created = function() {
  Session.set('playModeId', 0);
  Session.set('displayModeId', 0);
  Session.set('playSpeed', 0.8);

  song = this.data.song;
  Session.set('currentTrackId', song.melodicTrackId);
}

Template.midiReplayer.rendered = function() {
  $('#replayer-slider').slider({
    range: "min",
    min: 0,
    max: song.notes.length - 1,
    value: 0,
  });

  MidiReplayer.init(song);

  YouPlayer.init(song);
  YouPlayer.start(); //because that's the default mode

  Deps.autorun(function() {
    // update slider when replayer starts
    $('#replayer-slider').slider({
      range: "min",
      min: 0,
      max: song.notes.length - 1,
      value: Session.get('replayerIndex'),
    });
  });
  
  // Warning: this jquery effect causes the whole template to re-render.
  // TODO: check if it's okay to remove autorun
  Deps.autorun(function() {
    // user changing the slider
    $('#replayer-slider').slider({
      slide: function(evt, ui) {
        if (playModes[Session.get('playModeId')] === "demo") {
          MidiReplayer.pause();
        } else if (playModes[Session.get('playModeId')] === "practice") {
          YouPlayer.pause();
        }
        
        Session.set('replayerIndex', ui.value);        
        Session.set('timeInTicks', MidiReplayer.notes[ui.value].startTimeInTicks);

        if (playModes[Session.get('playModeId')] === "demo") {
          MidiReplayer.start();
        } else if (playModes[Session.get('playModeId')] === "practice") {
          YouPlayer.start();
        }

        // needed for the trigger to work correctly
        $(window).trigger('replayerSliderMoved');
        // simpleRecorder.clear(); // TODO: clean up
      }
    });  
  });

  Deps.autorun(function() {
    var currentTrackId = Session.get('currentTrackId');

    if (currentTrackId) {
      simpleKeyboard.setGreenCondition(function(note) {
        return note.trackId === currentTrackId;
      });
    }
  })
}

Template.midiReplayer.destroyed = function() {
  MidiReplayer.stop();
  YouPlayer.destroy();
}

Template.midiReplayer.events({
  'click #display-mode-change': function() {
    Session.set('displayModeId', (Session.get('displayModeId') + 1) % displayModes.length);
  },

  'click #play-mode-change': function() {
    var playModeId = Session.get('playModeId');
    playModeId = (playModeId + 1) % playModes.length;
    Session.set('playModeId', playModeId);
    if (playModes[playModeId] === 'demo') {
      YouPlayer.pause();
      MidiReplayer.clearDisplayedNotes();
      MidiReplayer.setMode(ReplayMode);
      MidiReplayer.start();

    } else if (playModes[playModeId] === 'pause') {
      MidiReplayer.pause();
      MidiReplayer.clearDisplayedNotes();

    } else if (playModes[playModeId] === 'practice') {
      MidiReplayer.pause();
      MidiReplayer.clearDisplayedNotes();
      YouPlayer.start();
    }

  },
});

Template.midiReplayer.helpers({  
  playMode: function() {
    var ret = {}
    ret[playModes[Session.get('playModeId')]] = 1;
    return ret;
  },
});

UI.registerHelper('displayMode', function() {
  var ret = {}
  ret[displayModes[Session.get('displayModeId')]] = 1;
  return ret;
});