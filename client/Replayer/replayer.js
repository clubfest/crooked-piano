// This is a replayer that loads songs from the database once you specify the replayerSongId

Template.replayer.rendered = function() {
  var song = this.data.replayerSong;

  simpleReplayer.init(song.notes);


  if (!this.rendered) {
    // TODO: move reset back to init when switching to shark
    this.rendered = true;

    simpleReplayer.reset();  
  }

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
        simpleRecorder.clear(); // TODO: clean up

        // if slider is moved while we are replaying, need to restart at new position
        if (Session.get('isReplaying') == true) {
          simpleReplayer.pause();
          simpleReplayer.play();
        } else {
          simpleReplayer.play();
        }
      }
    });  
  })
}

Template.replayer.destroyed = function() {
  simpleReplayer.destroy();
}

Template.replayer.events({
  'click .replayer-start': function(evt, tmpl) {
    simpleReplayer.play();
  },

  'click .replayer-stop': function(evt, tmpl) {
    simpleReplayer.stop();
  },
});

Template.replayer.isReplaying = function() {
  return Session.get('isReplaying');
};
