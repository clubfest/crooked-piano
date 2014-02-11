
Handlebars.registerHelper('message', function() {
  return Session.get('message');
});

Handlebars.registerHelper('segmentLevel', function() {
  return Session.get('segmentLevel');
});
