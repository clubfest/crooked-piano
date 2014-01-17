
Template.leadPlayer.created = function() {
  LeadPlayer.create();
  
}

Template.leadPlayer.rendered = function() {
  LeadPlayer.redisplayNotes();
}

Template.leadPlayer.destroyed = function() {
  LeadPlayer.destroy();
}

