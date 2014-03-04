
Handlebars.registerHelper('message', function() {
  return Session.get('message');
});

Handlebars.registerHelper('youtubeId', function() {
  // this should be a song context
  return this.youtubeId;
});

Handlebars.registerHelper('absoluteUrl', function() {
  // this should be a song context
  return Meteor.absoluteUrl();
});

Handlebars.registerHelper('isIos', function() {
  return IS_IOS;
});

Handlebars.registerHelper('join', function(array) {
  // todo: escape user input string
  var ret = array.join("");
  ret = ret.replace(/[!.?,;:]/g, "$&<br/>");
  return ret;
})
