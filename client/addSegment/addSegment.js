
Template.addSegment.rendered = function() {
  var song = Session.get('song');
  Monotrome.setTime(song.monotromeTime);
  Monotrome.setFrequency(song.monotromeFrequency);
}

Template.addSegment.destroyed = function() {
  Monotrome.pause();
}

Template.addSegment.events({
  'click #monotrome-play': function() {
    $(window).on('keyboardDown.monotrome', function(evt, data) {
      var freq = Monotrome.getFrequency();
      if (data.isFromReplayer === true) {
        window.setTimeout(function() {
          Monotrome.play();
        }, (1 - fractionalPart((data.time - Monotrome.getTime()) * freq)) * 1000 / freq);
        $(window).off('keyboardDown.monotrome');
      }
    });
  },

  'click #monotrome-pause': function() {
    Monotrome.pause();
  },
});

function fractionalPart(num) {
  return num - Math.floor(num);
}
