

Template.result.hasPassed = function() {
  return Session.get('score') >= 20;
}

Template.result.scoreTallied = function() {
  return Session.get('hasTallied');
}

Handlebars.registerHelper('score', function() {
  return Session.get('score');
});

Template.result.scoreTallied = function() {
  return Session.get('scoreTallied');
}

Template.result.hasScore = function() {
  return Session.get('score') !== null;
}
