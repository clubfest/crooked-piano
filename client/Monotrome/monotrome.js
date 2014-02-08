
Template.monotrome.created = function() {
  Monotrome.init();
}

Template.monotrome.rendered = function() {
  $('.monotrome-slider').slider({
    min: 0,
    max: 2.5,
    step: 0.1,
    value: Session.get('monotromeFrequency'),
    slide: function(evt, ui) {
      Session.set('monotromeFrequency', ui.value);
      Monotrome.pause();
      
      if (ui.value > 0) {
        Monotrome.play();
      } else {
        Monotrome.setTime(null);
      }
    },
  });
}

Template.monotrome.destroyed = function() {
  Monotrome.pause();
}

Template.monotrome.events({
  'click #monotrome-play': function() {
    Monotrome.play();
  },

  'click #monotrome-pause': function() {
    Monotrome.pause();
  },

  'click #monotrome-inc-freq': function() {
    Monotrome.incFreq();
  },

  'click #monotrome-dec-freq': function() {
    Monotrome.decFreq();
  },
})