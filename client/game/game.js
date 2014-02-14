/*
  Put in the intro page, with a next button: this modify the 
  Put in the keyboard and youPlayer, with a back button,
*/
// var players = [OneHandPlayer, LeadPlayer, 'AccompanyingPlayer', 'singAlong', 'duet', 'recital', 'twoHand'];

Template.game.created = function() {
  // segmentLevel initiation is moved to routing.js

  // going from left hand to right hand;
  // TODO: find a better way to check for that or add a variable.
  // if (typeof Session.get('segmentLevel') === 'undefined') {
  //   Session.set('segmentLevel', 0);
  //   // Session.set('playLevel', 1);
  // }
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
  }

  $('.play-slider').slider({
    slide: function(evt, ui) {
      LeadPlayer.reset(ui.value);
    },
  })
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
    // var level = Session.get('playLevel');
    
    // if (level === 0) {
      // Session.set('playLevel', 1);
    // } else {
      // // level === 1, i.e. lead player
      // try { 
      //   LeadPlayer.saveGame(); // TODO: find a better place to put this
      // } catch (e) {
      //   // alert('')
      // }

      // Session.set('playLevel', 0);

      LeadPlayer.saveGame();
      
      // var segmentLevel = Session.get('segmentLevel');
      // Session.set('segmentLevel', segmentLevel + 1);

      // var rightLength = this.song.rightSegments.length;
      // var leftLength = this.song.leftSegments.length;

      // if (segmentLevel + 1 === rightLength ||
          // segmentLevel + 1 === rightLength + leftLength) {
          TempGames.merge();
          Router.go('profile');
      // } else {
      //   LeadPlayer.destroy();
      //   LeadPlayer.create(this.song);
      // // }
    // }
  },

  'click #retry-game': function() {
    // players[Session.get('playLevel')].reset();
    LeadPlayer.reset();
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

// Template.game.levelZero = function() {
//   return Session.get('playLevel') === 0;
// }

// Template.game.levelOne = function() {
//   return Session.get('playLevel') === 1;
// }

// Template.game.levelTwo = function() {
//   return Session.get('playLevel') === 2;
// }
