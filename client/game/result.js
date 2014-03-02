

Template.result.hasPassed = function() {
  return Session.get('score') >= -1;
}

Handlebars.registerHelper('score', function() {
  return Session.get('score');
});

Handlebars.registerHelper('scoreTallied', function() {
  return Session.get('scoreTallied');
});

Handlebars.registerHelper('hasScore', function() {
  return Session.get('score') !== null;
});

Template.result.inEditMode = function() {
  return location.href.match(/editSong/i); // fix this hack
}
