
Template.segmentMonotrome.created = function() {
  Monotrome.init();

  var song = Session.get('song');
  Monotrome.setTime(song);
  Monotrome.setFrequency(song.monotromeFrequency);

  if (song.monotromeTime) {
    console.log(song.monotromeTime)
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

