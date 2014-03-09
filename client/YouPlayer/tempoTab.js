
Template.tempoTab.rendered = function() {
  $('#speed-slider').slider({
    range: 'min',
    min: .1,
    max: 1.4,
    step: 0.05,
    value: Session.get('playSpeed'),
    slide: function(evt, ui) {
      Session.set('playSpeed', ui.value);
    },
  });
}

Template.tempoTab.events({
  'click #synchronous': function() {
    Session.set('isSynchronous', true);
  },

  'click #asynchronous': function() {
    Session.set('isSynchronous', false);
    LeadPlayer.transferProximateNotesToComputer();
  },
})