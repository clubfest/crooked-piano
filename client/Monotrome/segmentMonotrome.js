
Template.segmentMonotrome.created = function() {
  Monotrome.init();

  var song = this.data.replayerSong;
  
  if (song.monotromeFrequency && song.monotromeTime) {
    Monotrome.setFrequency(song.monotromeFrequency);
    Monotrome.setTime(song.monotromeTime);

    //todo: rid 1
    Session.set('hasMonotrome', true);
    Session.set('monotromeIsSet', true);
  }
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

