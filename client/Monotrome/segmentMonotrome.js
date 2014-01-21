
Template.segmentMonotrome.created = function() {
  Monotrome.init();

  Deps.autorun(function() {
    var song = Session.get('replayerSong');
    
    if (song) {
      if (song.monotromeFrequency) {
        Monotrome.setFrequency(song.monotromeFrequency);
      }

      if (song.monotromeTime) {
        Session.set('hasMonotrome', true);
        Session.set('monotromeIsSet', true);
      }
    }
  });

}

Template.segmentMonotrome.destroyed = function() {
  Session.set('hasMonotrome', false);
  Session.set('monotromeIsSet', false);
  Monotrome.pause();
}

Template.segmentMonotrome.monotromeIsSet = function() {
  return Session.get('monotromeIsSet');
}

Template.segmentMonotrome.hasMonotrome = function() {
  return Session.get('hasMonotrome');
}


Template.segmentMonotrome.events({
  'click #monotrome-set': function() {
    Session.set('monotromeIsSet', true);
  },

  'click #monotrome-unset': function() {
    Session.set('monotromeIsSet', false);
    Monotrome.pause();
  },
});

