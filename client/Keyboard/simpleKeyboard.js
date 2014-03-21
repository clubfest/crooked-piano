IS_IOS = navigator.userAgent.match(/(iPhone|iPad|webOs|Android)/i);

simpleKeyboard = {
  channel: 0,
  velocity: 80,
  shift: 0,
  hasPedal: true,

  connectMouseToKeyboard: function() {
    var self = this;

    $('.key').off('mousedown.keyboard');
    $('.key').on('mousedown.keyboard', function(evt){
      var keyCode = parseInt($(evt.target).closest('.key').data('keyCode'));
      var note = convertKeyCodeToNote(keyCode);

      if (typeof note !== "undefined") {
        note = self.adjustShift(note);
        $(window).trigger('keyboardDown', {
          time: new Date().getTime(),
          keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });
      }
    });

    $('.key').off('mouseup.keyboard');
    $('.key').on('mouseup.keyboard', function(evt) {
      var keyCode = parseInt($(evt.target).closest('.key').data('keyCode'));
      var note = convertKeyCodeToNote(keyCode);

      if (typeof note !== "undefined") {
        note = self.adjustShift(note);
        $(window).trigger('keyboardUp', {
          time: new Date().getTime(),
          keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });
      }
    })
  },

  connectTouchToKeyboard: function() {
    var self = this;

    $('.key').off('touchstart.keyboard');
    $('.key').on('touchstart.keyboard', function(evt){
      var keyCode = parseInt($(evt.target).closest('.key').data('keyCode'));
      var note = convertKeyCodeToNote(keyCode);

      if (typeof note !== "undefined") {
        note = self.adjustShift(note);
        $(window).trigger('keyboardDown', {
          time: new Date().getTime(),
          keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });
      }
    });

    $('.key').off('touchend.keyboard');
    $('.key').on('touchend.keyboard', function(evt) {
      var keyCode = parseInt($(evt.target).closest('.key').data('keyCode'));
      var note = convertKeyCodeToNote(keyCode);

      if (typeof note !== "undefined") {
        note = self.adjustShift(note);
        $(window).trigger('keyboardUp', {
          time: new Date().getTime(),
          keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });
      }
    });
  },

  connectKeyToKeyboard: function() {
    var self = this;
    var downKeys = {};

    $(window).on('keydown.keyboard', function(evt) {
      if (typeof event !== 'undefined') {
        var d = event.srcElement || event.target;

        var inInputField = (d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE')) 
                 || d.tagName.toUpperCase() === 'TEXTAREA';
      }
      
      if (inInputField) return ;

      var keyCode = fixKeyCode(evt.keyCode);
      if (downKeys[keyCode] === true) {
        return ;
      } else {
        downKeys[keyCode] = true;
      }

      var note = convertKeyCodeToNote(keyCode);

      if (typeof note !== "undefined") {
        note = self.adjustShift(note);
        
        $(window).trigger('keyboardDown', {
          time: new Date().getTime(),
          keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });

      } else {
        //TODO
        self.adjustSettings(keyCode);
      }

      // prevent backspace from navigating back in the browser
      if (evt.which === 8) {
        evt.preventDefault();
      }
    });

    $(window).on('keyup.keyboard', function(evt) {
      var keyCode = fixKeyCode(evt.keyCode);

      delete downKeys[keyCode];

      var note = convertKeyCodeToNote(keyCode);

      if (typeof note !== "undefined") {
        note = self.adjustShift(note);

        $(window).trigger('keyboardUp', {
          time: new Date().getTime(),
          keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });
      }
    });
  },

  connectKeyboardToDisplay: function() {
    var self = this;

    $(window).on('keyboardDown.display', function(evt, data) {
      if (data.channel === self.channel && !data.playedByComputer) {
        var dom = $('[data-key-code="' + data.keyCode + '"]');
        dom.addClass('keydown').html('<span>'+noteToName(data.note, Session.get('isAlphabetNotation'))+'</span>');
      }
    });

    $(window).on('keyboardUp.display', function(evt, data) {
      if (data.channel === self.channel) {
        var dom = $('[data-key-code="' + data.keyCode + '"]');
        dom.removeClass('keydown');
      }
    });
  },

  adjustShift: function(note) {
    note += this.shift;
    return note;
  },

  adjustSettings: function(keyCode) {
    // if (keyCode === 38) {
    //   this.shift++;
    // } else if (keyCode === 40){
    //   this.shift--;
    // } 
    // else if (keyCode === 37) {
    //   this.velocity -= 30;
    // } else if (keyCode === 39) {
    //   this.velocity += 30;
    // }
  },
}

///// init
simpleKeyboard.connectKeyToKeyboard();
simpleKeyboard.connectKeyboardToDisplay();


////// helpers
function fixKeyCode(keyCode) {
  // firefox incompatibility
  if (keyCode === 59) {
    keyCode = 186;
  } else if (keyCode === 61) {
    keyCode = 187;
  } else if (keyCode === 173) {
    keyCode = 189;
  }

  return keyCode
}

function convertKeyCodeToNote(keyCode) {
  return keyCodeToNote[keyCode];
}

noteToName = function(note, alphabet) {
  note = (note - 60) % 12;

  if (note < 0) {
    note += 12;
  }

  if (alphabet) {
    if (1 || Session.get('isSharp')) {
      var conversion = {
        0: 'C',
        1: 'C\u266F',
        2: 'D',
        3: 'D\u266F',
        4: 'E',
        5: 'F',
        6: 'F\u266F',
        7: 'G',
        8: 'G\u266F',
        9: 'A',
        10: 'A\u266F',
        11: 'B',
      };
    } else {
      var conversion = {
        0: 'C',
        1: 'D\u266D',
        2: 'D',
        3: 'E\u266D',
        4: 'E',
        5: 'F',
        6: 'G\u266D',
        7: 'G',
        8: 'A\u266D',
        9: 'A',
        10: 'B\u266D',
        11: 'B',
      };
    }


  } else {
    var conversion = {
      0: 'DO',
      1: 'DI',
      2: 'RE',
      3: 'RI',
      4: 'MI',
      5: 'FA',
      6: 'FI',
      7: 'SO',
      8: 'SI',
      9: 'LA',
      10: 'LI',
      11: 'TI',
    };
  }

  return conversion[note];
}
