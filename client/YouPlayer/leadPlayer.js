
Template.leadPlayer.created = function() {
}

Template.leadPlayer.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    LeadPlayer.create();
  }
  LeadPlayer.redisplayNotes();
}

Template.leadPlayer.destroyed = function() {
  LeadPlayer.destroy();
}

