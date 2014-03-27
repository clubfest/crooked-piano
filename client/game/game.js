
Template.game.rendered = function() {
  var songId = this.data.song._id;

  Meteor.call('incrementViewCount', songId);

  if (Meteor.userId()) {
    Meteor.call('updateLastVisitedGame', songId);
  }  
}

Template.game.gameFinished = function() {
  return Session.get('gameFinished');
}

Handlebars.registerHelper('isAlphabetNotation', function() {
  return Session.get('isAlphabetNotation');
});
