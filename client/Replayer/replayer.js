
Template.replayer.created = function() {

  Deps.autorun(function() {
    var song = Session.get('replayerSong');
    
    if (typeof song !== 'undefined') {
      simpleReplayer.init(song.notes);
    }
  });
}

Template.replayer.rendered = function() {
  // update slider;
  var song = Session.get('replayerSong');
    
  if (!song || !song.notes) return;

  Deps.autorun(function() {
    song
    $('.slider').slider({
      range: "min",
      min: 0,
      max: song.notes.length - 1,
      value: Session.get('replayerIndex'),
    });
  });

  // user changing the slider
  $('.slider').slider({
    slide: function(evt, ui) {

      Session.set('replayerIndex', ui.value);

      // if slider is moved while we are replaying, need to restart at new position
      if (Session.get('isReplaying') == true) {
        simpleReplayer.pause();
        simpleReplayer.play();
      }
    }
  });
}

Template.replayer.destroyed = function() {
  simpleReplayer.destroy();
}

Template.replayer.events({
  'click .replayer-start': function(evt, tmpl) {
    simpleReplayer.play();
  },

  'click .replayer-pause': function(evt, tmpl) {
    simpleReplayer.pause();
  },
});

Template.replayer.isReplaying = function() {
  return Session.get('isReplaying');
};
