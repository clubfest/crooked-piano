
Template.oneHandPlayer.created = function() {
  
}

Template.oneHandPlayer.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    OneHandPlayer.create();
  }
  OneHandPlayer.redisplayNotes();
}

Template.oneHandPlayer.destroyed = function() {
  console.log('hi')
  OneHandPlayer.destroy();
}

Handlebars.registerHelper('score', function() {
  return Session.get('score');
});

Handlebars.registerHelper('hasScore', function() {
  return Session.get('score') !== null;
});
