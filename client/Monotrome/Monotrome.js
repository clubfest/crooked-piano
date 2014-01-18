MONOTROME_CHANNEL = 3;

Monotrome = {
  time: null,
  timeout: null,

  getFrequency: function() {
    return Session.get('monotromeFrequency');
  },

  getTime: function() {
    return Monotrome.time;
  },

  setFrequency: function(freq) {
    Session.set('monotromeFrequency', freq);
  },

  setTime: function(time) {
    Monotrome.time = time;
  },

  init: function() {
    Session.set('monotromeFrequency', 0);
    Session.set('monotromeOn', false);
  },

  play: function() {
    Session.set('monotromeOn', true);
    this.time = (new Date).getTime();
    console.log('monotromeOn ' + this.time);
    this._play();
  },

  pause: function() {
    window.clearTimeout(this.timeout);
    Session.set('monotromeOn', false);
  },

  _play: function() {
    var self = this;

    MIDI.noteOn(MONOTROME_CHANNEL, 98, 20);
    this.timeout = window.setTimeout(function(){
      self._play();
    }, 1000 / Session.get('monotromeFrequency'));
  },

  syncMonotromeWithSong: function() {
    $(window).on('keyboardDown.monotrome', function(evt, data) {
      var freq = Monotrome.getFrequency();

      if (data.isFromReplayer === true) {
        window.setTimeout(function() {
          Monotrome.play();
        }, (1 - fractionalPart((data.time - Session.get('song').monotromeTime) * freq / 1000)) * 1000 / freq);
        
        $(window).off('keyboardDown.monotrome');
      }
    });
  },
}

function fractionalPart(num) {
  return num - Math.floor(num);
}