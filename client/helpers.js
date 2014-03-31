
UI.registerHelper('message', function() {
  return Session.get('message');
});

UI.registerHelper('youtubeId', function() {
  // this should be a song context
  return this.youtubeId;
});

UI.registerHelper('absoluteUrl', function() {
  // this should be a song context
  return Meteor.absoluteUrl();
});

UI.registerHelper('isIos', function() {
  return IS_IOS;
});


htmlEncode = function(str) {
  return str.replace(/[&<>"']/g, function($0) {
    return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[$0] + ";";
  });
}


