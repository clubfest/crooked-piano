
Template.oneHandPlayer.created = function() {
  OneHandPlayer.create();
  
}

Template.oneHandPlayer.rendered = function() {
  OneHandPlayer.redisplayNotes();
}

Template.oneHandPlayer.destroyed = function() {
  OneHandPlayer.destroy();
}

Handlebars.registerHelper('score', function() {
  return Session.get('score');
});

Handlebars.registerHelper('hasScore', function() {
  return Session.get('score') !== null;
});
