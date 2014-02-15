var song;

Template.leadPlayer.created = function() {
  Session.setDefault('playSpeed', .9);
  Session.setDefault('isSynchronous', true);
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
}

Template.leadPlayer.destroyed = function() {
  LeadPlayer.destroy();
}

Template.leadPlayer.events({
  'click #synchronous': function() {
    Session.set('isSynchronous', true);
  },

  'click #asynchronous': function() {
    Session.set('isSynchronous', false);
    LeadPlayer.transferProximateNotesToComputer();
    LeadPlayer.playComputerProximateNotes();
  },
})

Template.leadPlayer.isSynchronous = function() {
  return Session.get('isSynchronous');
}
