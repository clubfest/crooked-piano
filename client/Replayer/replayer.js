
Template.replayer.created = function() {
  // this.replayer = new Replayer;
  Deps.autorun(function() {
    var song = Session.get('song');
    if (typeof song !== 'undefined') {
      simpleReplayer.init(song.notes);
    }
  });
}

Template.replayer.rendered = function() {
  // update slider;
  Deps.autorun(function() {
    $('.slider').slider({
      range: "min",
      min: 0,
      max: simpleReplayer.notes.length - 1,
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
