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
      var noteNumber = convertKeyCodeToNote(keyCode);

      if (typeof noteNumber !== "undefined") {
        noteNumber = self.adjustShift(noteNumber);
        $(window).trigger('keyboardDown', {
          time: new Date().getTime(),
          keyCode: keyCode,
          noteNumber: noteNumber,
          channel: self.channel,
          velocity: self.velocity,
          pedalOn: true,
          userTriggered: true,
        });
      }
    });

    $('.key').off('mouseup.keyboard');
    $('.key').on('mouseup.keyboard', function(evt) {
      var keyCode = parseInt($(evt.target).closest('.key').data('keyCode'));
      var noteNumber = convertKeyCodeToNote(keyCode);

      if (typeof noteNumber !== "undefined") {
        noteNumber = self.adjustShift(noteNumber);
        $(window).trigger('keyboardUp', {
          time: new Date().getTime(),
          keyCode: keyCode,
          noteNumber: noteNumber,
          channel: self.channel,
          velocity: self.velocity,
          pedalOn: true,
          userTriggered: true,
        });
      }
    })
  },

  connectTouchToKeyboard: function() {
    var self = this;

    $('.key').off('touchstart.keyboard');
    $('.key').on('touchstart.keyboard', function(evt){
      var keyCode = parseInt($(evt.target).closest('.key').data('keyCode'));
      var noteNumber = convertKeyCodeToNote(keyCode);

      if (typeof noteNumber !== "undefined") {
        noteNumber = self.adjustShift(noteNumber);
        $(window).trigger('keyboardDown', {
          time: new Date().getTime(),
          keyCode: keyCode,
          noteNumber: noteNumber,
          channel: self.channel,
          velocity: self.velocity,
          pedalOn: true,
          userTriggered: true,
        });
      }
    });

    $('.key').off('touchend.keyboard');
    $('.key').on('touchend.keyboard', function(evt) {
      var keyCode = parseInt($(evt.target).closest('.key').data('keyCode'));
      var noteNumber = convertKeyCodeToNote(keyCode);

      if (typeof noteNumber !== "undefined") {
        noteNumber = self.adjustShift(noteNumber);
        $(window).trigger('keyboardUp', {
          time: new Date().getTime(),
          keyCode: keyCode,
          noteNumber: noteNumber,
          channel: self.channel,
          velocity: self.velocity,
          pedalOn: true,
          userTriggered: true,
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

      var noteNumber = convertKeyCodeToNote(keyCode);

      if (typeof noteNumber !== "undefined") {
        noteNumber = self.adjustShift(noteNumber);
        
        $(window).trigger('keyboardDown', {
          time: new Date().getTime(),
          keyCode: keyCode,
          noteNumber: noteNumber,
          channel: self.channel,
          velocity: self.velocity,
          pedalOn: true,
          userTriggered: true,
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

      var noteNumber = convertKeyCodeToNote(keyCode);

      if (typeof noteNumber !== "undefined") {
        noteNumber = self.adjustShift(noteNumber);
        $(window).trigger('keyboardUp', {
          time: new Date().getTime(),
          keyCode: keyCode,
          noteNumber: noteNumber,
          channel: self.channel,
          velocity: self.velocity,
          pedalOn: true,
          userTriggered: true,
        });
      }
    });
  },

  setGreenCondition: function(condition) {
    this.greenCondition = condition; // condition(note)
  },

  connectKeyboardToDisplay: function() {
    var self = this;

    $(window).on('keyboardDown.display', function(evt, data) {
      var dom = $('[data-key-code="' + data.keyCode + '"]');
      if (data.channel !== DRUM_CHANNEL) {
        if (data.userTriggered) {
          dom.addClass('keydown');
        } else if (self.greenCondition && self.greenCondition(data)) {
          dom.addClass('my-note keydown')
        } else {
          dom.addClass('computer-key-down');
        }        
        dom.html('<span>'+noteToName(data.noteNumber, Session.get('isAlphabetNotation'))+'</span>');
      }
    });

    $(window).on('keyboardUp.display', function(evt, data) {
      var dom = $('[data-key-code="' + data.keyCode + '"]');
      dom.html('<span>' + dom.data('content') + '</span>')
      dom.removeClass('keydown computer-key-down my-note');
    });
  },

  adjustShift: function(noteNumber) {
    noteNumber += this.shift;
    return noteNumber;
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

noteNumberToAoeui = function(noteNumber) {
    var conversion = {
      41: 'j',  
      42: 'k',
      43: 'u',
      45: '3',
      47: '`',
      48: '1',
      49: '2',
      50: "'",
      51: ',',
      52: 'a',
      53: ';',
      54: 'q',
      55: 'o',
      56: 'e',
      57: '.',
      58: 'p',
      59: '4',
      60: '5',
      61: '6',
      62: 'y',
      63: 'f',
      64: 'i',
      65: 'x',
      66: 'b',
      67: 'i',
      68: 'h',
      69: 'g',
      70: 'c',
      71: '8',
      72: '9',
      73: '0',
      74: 'r',
      75: 'l',
      76: 'n',
      77: 'v',
      78: 'z',
      79: 's',
      80: '-',
      81: '/',
      82: '=',
      83: ']',
      84: 'del',
      86:  '\\',
      88: '[',
      89: 'm',
      90: 'w',
      91: 't',
      93: '7',
    }
  var ret = conversion[noteNumber];
  if (!ret) ret = noteNumber.toString();

  return ret;
}

noteToName = function(noteNumber, alphabet) {
  noteNumber = (noteNumber - 60) % 12;

  if (noteNumber < 0) {
    noteNumber += 12;
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

  return conversion[noteNumber];
}
