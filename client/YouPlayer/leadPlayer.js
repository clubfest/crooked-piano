var song;
var isPreview;

Template.leadPlayer.created = function() {
  Session.setDefault('playSpeed', .9);
  Session.setDefault('isSynchronous', true);
  song = this.data.song;

  LeadPlayer.create(song);
  isPreview = true;
}

Template.leadPlayer.rendered = function() {
  // if (!this.rendered) {
  //   this.rendered = true;
  // }
  if (isPreview) {
    var self = this;
    Deps.autorun(function() {
      var song = self.data.song;
      if (song.notes) {
        LeadPlayer.setPlayNotes(song.notes);
        isPreview = false;
      }
    });
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
  },

  'click #play-btn': function() {
    MIDI.noteOn(0, 60, 60);
  },
})

Template.leadPlayer.isSynchronous = function() {
  return Session.get('isSynchronous');
}

Template.leadPlayer.loadProgress = function() {
  var loadProgress = Session.get('loadProgress') || 1;
  return Math.floor(loadProgress * 100 / 12);
}
