
Template.accompanyingPlayer.created = function() {
  AccompanyingPlayer.create();
  
}

Template.accompanyingPlayer.rendered = function() {
  AccompanyingPlayer.redisplayNotes();
}

Template.accompanyingPlayer.destroyed = function() {
  AccompanyingPlayer.destroy();
}

