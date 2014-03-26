
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


htmlEncode = function(str) {
  return str.replace(/[&<>"']/g, function($0) {
    return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[$0] + ";";
  });
}


