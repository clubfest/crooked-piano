
Template.oneHandPlayer.rendered = function() {
  if (!this.rendered) {    
    this.rendered = true;

    OneHandPlayer.create(this.data.song);
  }
  OneHandPlayer.redisplayNotes();
}

Template.oneHandPlayer.destroyed = function() {
  OneHandPlayer.destroy();
}


