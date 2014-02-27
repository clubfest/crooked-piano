var songId;

Template.game.created = function() {
  songId = this.data.song._id;
}
Template.game.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    // must be put here to prevent called indefinitely
    Meteor.call('incrementPlayCount', songId, function(err) {
      if (err) {
        alert(err.reason);
      }
    });

    if (Meteor.userId()) {
      Meteor.call('updateLastVisitedGame', songId, function(err){ 
        if(err) {
          alert(err.reason);
        }
      });
    }  
  }

  $('.play-slider').slider({
    slide: function(evt, ui) {
      LeadPlayer.reset(ui.value);
      LeadPlayer.updateProximateNotes();
    },
  });
}

Template.game.events({
  'click #reload-sound': function() {
    loadSound();
  }
});

Handlebars.registerHelper('isAlphabetNotation', function() {
  return Session.get('isAlphabetNotation');
});
