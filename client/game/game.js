/*
  Put in the intro page, with a next button: this modify the 
  Put in the keyboard and youPlayer, with a back button,
*/
var players = [OneHandPlayer, LeadPlayer, 'AccompanyingPlayer', 'singAlong', 'duet', 'recital', 'twoHand'];

Template.game.created = function() {
  // going from left hand to right hand;
  // TODO: find a better way to check for that or add a variable.
  if (typeof Session.get('segmentLevel') === 'undefined' || typeof Session.get('playLevel') === 'undefined') {
    Session.set('segmentLevel', 0);
    Session.set('playLevel', 0);
  }
}

Template.game.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;
    
    Deps.autorun(function() {
      $('.play-slider').slider({
        range: "min",
        min: 0,
        max: Session.get('playLength'),
        value: players[Session.get('playLevel')].getIndex(),
      });
    });   
  }
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
    
    if (level === 0) {
      Session.set('playLevel', 1);
    } else {
      // level === 1, i.e. lead player
      LeadPlayer.saveGame(); // TODO: find a better place to put this

      Session.set('playLevel', 0);

      var segmentLevel = Session.get('segmentLevel');
      Session.set('segmentLevel', segmentLevel + 1);

      var rightLength = this.song.rightSegments.length;
      var leftLength = this.song.leftSegments.length;

      if (segmentLevel + 1 === rightLength ||
          segmentLevel + 1 === rightLength + leftLength) {
        TempGames.merge();
        Router.go('profile');
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
