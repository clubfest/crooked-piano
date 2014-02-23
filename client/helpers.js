
Handlebars.registerHelper('message', function() {
  return Session.get('message');
});

Handlebars.registerHelper('youtubeId', function() {
  // this should be a song context
  return this.youtubeId;
});