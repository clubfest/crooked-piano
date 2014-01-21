
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
  OneHandPlayer.destroy();
}


