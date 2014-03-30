
Template.game.rendered = function() {
  var songId = this.data.song._id;

  Meteor.call('incrementViewCount', songId);
}

Template.game.events({

});

Template.game.gameFinished = function() {
  return Session.get('gameFinished');
}

Handlebars.registerHelper('isAlphabetNotation', function() {
  return Session.get('isAlphabetNotation');
});
