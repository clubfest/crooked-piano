var songId;

Template.game.created = function() {
  songId = this.data.song._id;
}
Template.game.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    Deps.autorun(function() {
      $('.play-slider').slider({
        range: "min",
        min: 0,
        max: Session.get('playLength'),
        value: LeadPlayer.getPlayIndex(),
      });
    }); 

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
  'click #demo': function() {
    // players[Session.get('playLevel')].demo();
    LeadPlayer.demo();
  },

  'click #pause-demo': function() {
    // players[Session.get('playLevel')].pauseDemo();
    LeadPlayer.pauseDemo();
  },

  'click #switch-track': function() {
    LeadPlayer.switchTrack();
  },

  'click #next-game': function() {
      LeadPlayer.saveGame();

      TempGames.merge();
      Router.go('profile');
  },

  'click #retry-game': function() {
    LeadPlayer.reset();
    LeadPlayer.updateProximateNotes();
  },

  'click #alphabet-notation': function() {
    Session.set('isAlphabetNotation', true);
  },

  'click #do-re-mi-notation': function() {
    Session.set('isAlphabetNotation', false);
  }
});

Handlebars.registerHelper('isAlphabetNotation', function() {
  return Session.get('isAlphabetNotation');
});
