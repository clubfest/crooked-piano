Template.midiReplayer.isReplaying = function() {
  return Session.get('isReplaying');
}

Template.midiReplayer.isYouplaying = function() {
  return Session.get('isYouplaying');
}

Template.midiReplayer.rendered = function() {
  Session.set('isYouplaying', true);

  song = this.data.song;
  MidiReplayer.init(song);

  $('.slider').slider({
    range: "min",
    min: 0,
    max: song.notes.length - 1,
    value: 0,
  });

  Deps.autorun(function() {
    // update slider when replayer starts
    $('.slider').slider({
      range: "min",
      min: 0,
      max: song.notes.length - 1,
      value: Session.get('replayerIndex'),
    });
  })
  
  // Warning: this jquery effect causes the whole template to re-render.
  // TODO: check if it's okay to remove autorun
  Deps.autorun(function() {
    // user changing the slider
    $('.slider').slider({
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
      }
    });  
  });
}

Template.midiReplayer.events({
  'click #replayer-start': function() {
    if (Session.get('isReplaying')) {
      MidiReplayer.pause();
    } else {
      MidiReplayer.start();      
    }
  },

  'click #youplayer-start': function() {
    if (Session.get('isYouplaying')) {
      Session.set('isYouplaying', false);
    } else {
      MidiReplayer.pause();
      Session.get('isReplaying', false)
      Session.set('isYouplaying', true);
    }
  }
})
