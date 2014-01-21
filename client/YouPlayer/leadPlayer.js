Template.leadPlayer.created = function() {
}

Template.leadPlayer.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    // Deps.autorun(function() {
    //   if (Session.get('song')) {
    //     LeadPlayer.create();
    //   }
    // })

    LeadPlayer.create();

  }
  LeadPlayer.redisplayNotes();
}

Template.leadPlayer.destroyed = function() {
  LeadPlayer.destroy();
}

