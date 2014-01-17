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
    Session.set('monotromeFrequency', 1.5);
    Session.set('monotromeOn', false);
  },

  play: function() {
    Session.set('monotromeOn', true);
    this.time = (new Date).getTime();
    this._play();
  },

  pause: function() {
    window.clearTimeout(this.timeout);
    Session.set('monotromeOn', false);
  },

  _play: function() {
    var self = this;

    MIDI.noteOn(MONOTROME_CHANNEL, 98, 20);
    // MIDI.noteOff(MONOTROME_CHANNEL, 25);
    
    this.timeout = window.setTimeout(function(){
      self._play();
    }, 1000 / Session.get('monotromeFrequency'));
  },
}