var displayModes = ['infoTab', 'soundTab', 'musicTab'];

Template.midiReplayer.isReplaying = function() {
  return Session.get('isReplaying');
}

Template.midiReplayer.rendered = function() {
  Session.set('displayModeId', 0);
  Session.set('playSpeed', 1 );
  if (!this.data || !this.data.song) return ;

  song = this.data.song;
  MidiReplayer.init(song);
  Session.set('currentTrackId', song.melodicTrackId);

  $('#replayer-slider').slider({
    range: "min",
    min: 0,
    max: song.notes.length - 1,
    value: 0,
  });

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
        Session.set('replayerIndex', ui.value);
        // simpleRecorder.clear(); // TODO: clean up

        // if slider is moved while we are replaying, need to restart at new position
        if (Session.get('isReplaying') == true) {
          MidiReplayer.pause();
          MidiReplayer.start();
        } else {
          MidiReplayer.start();
        }
        
        Session.set('timeInTicks', MidiReplayer.notes[ui.value].startTimeInTicks);
        // needed for the trigger to work correctly
        $(window).trigger('replayerSliderMoved');
      }
    });  
  });

  Deps.autorun(function() {
    var currentTrackId = Session.get('currentTrackId');

    if (currentTrackId || currentTrackId === 0) {
      simpleKeyboard.setDisplayCondition(function(note) {
        return note.trackId === currentTrackId;
      });
    }
  })
}

Template.midiReplayer.destroyed = function() {
  if (Session.get('isReplaying')) {
    MidiReplayer.stop();
  }
}

Template.midiReplayer.events({
  'click #replayer-start': function() {
    if (Session.get('isReplaying')) {
      MidiReplayer.pause();
    } else {
      MidiReplayer.start();      
    }
  },

  'click #display-mode-change': function() {
    Session.set('displayModeId', (Session.get('displayModeId') + 1) % displayModes.length);
  }
});

Handlebars.registerHelper('displayMode', function() {
  var ret = {}
  ret[displayModes[Session.get('displayModeId')]] = 1
  return ret;
});
