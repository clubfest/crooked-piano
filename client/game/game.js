/*
  Put in the intro page, with a next button: this modify the 
  Put in the keyboard and youPlayer, with a back button,
*/
var players = [OneHandPlayer, LeadPlayer, 'AccompanyingPlayer', 'singAlong', 'duet', 'recital', 'twoHand'];

Template.game.created = function() {
  Session.set('segmentLevel', 0);
  Session.set('playLevel', 0);
}

Template.game.events({
  'click #demo': function() {
    players[Session.get('playLevel')].demo();
  },

  'click #pause-demo': function() {
    players[Session.get('playLevel')].pauseDemo();
  },

  'click #next-game': function() {
    var level = Session.get('playLevel');

    if (level < 1) {
      Session.set('playLevel', 1);
    } else {
      Session.set('playLevel', 0);
      var segmentLevel = Session.get('segmentLevel');
      if (segmentLevel < Session.get('song').segmentIds.length - 1) {
        Session.set('segmentLevel', segmentLevel + 1);
      }
    }
  },

  'click #retry-game': function() {
    players[Session.get('playLevel')].reset();
  },
});

Template.game.levelZero = function() {
  return Session.get('playLevel') === 0;
}

Template.game.levelOne = function() {
  return Session.get('playLevel') === 1;
}

Template.game.levelTwo = function() {
  return Session.get('playLevel') === 2;
}