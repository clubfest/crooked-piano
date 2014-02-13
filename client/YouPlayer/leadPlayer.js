var song;

Template.leadPlayer.created = function() {
  Session.setDefault('playSpeed', .7);
  song = this.data.song;
}

Template.leadPlayer.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    LeadPlayer.create(song);
  }

  LeadPlayer.redisplayNotes();

  $('#speed-slider').slider({
    range: 'min',
    min: .1,
    max: 1,
    step: 0.05,
    value: Session.get('playSpeed'),
    slide: function(evt, ui) {
      Session.set('playSpeed', ui.value);
    },
  });  

  // $('#track-slider').slider({
  //   range: 'min',
  //   min: 0,
  //   max: song.segmentIds.length,
  //   value: Session.get('segmentLevel'),
  //   slide: function(evt, ui) {
  //     Session.set('segmentLevel', ui.value);
  //   },
  // });
}

Template.leadPlayer.destroyed = function() {
  LeadPlayer.destroy();
}

