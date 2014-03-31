
Template.soundTab.rendered = function() {
  $('#background-volume-slider').slider({
    range: 'min',
    min: 0,
    max: 1.5,
    step: 0.1,
    value: Session.get('backgroundVolume'),
    slide: function(evt, ui) {
      Session.set('backgroundVolume', ui.value);
    },
  });

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

Template.soundTab.events({
  'click #synchronous': function() {
    YouPlayer.undisplayNotes();
    Session.set('isSynchronous', true);
  },

  'click #asynchronous': function() {
    Session.set('isSynchronous', false);
    YouPlayer.undisplayNotes();
    YouPlayer.transferProximateNotesToComputer();
    YouPlayer.displayNotes();
  },
  'click #switch-track': function() {
    YouPlayer.switchTrack();
  },
});

Template.soundTab.isSynchronous = function() {
  return Session.get('isSynchronous');
}

Template.soundTab.globalTonality = function() {
  return "C major";
}

Template.soundTab.shift = function() {
  return Session.get('shift');
}
