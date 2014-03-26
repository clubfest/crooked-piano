
Template.game.rendered = function() {
  var songId = this.data.song._id;

  Meteor.call('incrementViewCount', songId);

  if (Meteor.userId()) {
    Meteor.call('updateLastVisitedGame', songId);
  }  
}


Handlebars.registerHelper('isAlphabetNotation', function() {
  return Session.get('isAlphabetNotation');
});
