Template.leadPlayer.created = function() {
  Session.setDefault('playSpeed', 1);
}

Template.leadPlayer.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    LeadPlayer.create(this.data.song);
  }

  LeadPlayer.redisplayNotes();

  $('#speed-slider').slider({
    range: 'min',
    min: .2,
    max: 1,
    step: 0.1,
    value: Session.get('playSpeed'),
    slide: function(evt, ui) {
      Session.set('playSpeed', ui.value);
    },
  });  
}

Template.leadPlayer.destroyed = function() {
  LeadPlayer.destroy();
}

