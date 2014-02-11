
simpleKeyboard = {
  channel: 0,
  velocity: 70,
  shift: 0,
  hasPedal: true,

  connectMouseToKeyboard: function() {
    var self = this;

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

      // prevent double-tap zooming
      if (self.lastTouched && new Date().getTime() - self.lastTouched < 501) {
        evt.preventDefault();
      }

      self.lastTouched = new Date().getTime();
    });

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

    // $(window).nodoubletapzoom();
  },


  connectKeyToKeyboard: function() {
      

    var self = this;
    var downKeys = {};

    $(window).on('keydown.keyboard', function(evt) {
      var d = event.srcElement || event.target;
      var inInputField = (d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE')) 
               || d.tagName.toUpperCase() === 'TEXTAREA';
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
      if (data.channel === self.channel) {
        var dom = $('[data-key-code="' + data.keyCode + '"]');
        dom.addClass('keydown').html('<span>'+noteToName(data.note, true)+'</span>');
      }
    });

    $(window).on('keyboardUp.display', function(evt, data) {
      if (data.channel === self.channel) {
        var dom = $('[data-key-code="' + data.keyCode + '"]');
        dom.removeClass('keydown').html('<span>'+dom.data('content')+'</span>');
      }
    });
  },

  adjustShift: function(note) {
    note += this.shift;
    return note;
  },

  adjustSettings: function(keyCode) {
    if (keyCode === 38) {
      this.shift++;
    } else if (keyCode === 40){
      this.shift--;
    } else if (keyCode === 37) {
      this.velocity -= 30;
    } else if (keyCode === 39) {
      this.velocity += 30;
    }
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

noteToName = function(note, letterVersion) {
  note = (note - 60) % 12;

  if (note < 0) {
    note += 12;
  }

    

  if (letterVersion) {
    var conversion = {
      0: 'C',
      1: 'C#',
      2: 'D',
      3: 'D#',
      4: 'E',
      5: 'F',
      6: 'F#',
      7: 'G',
      8: 'G#',
      9: 'A',
      10: 'A#',
      11: 'B',
    };
  } else {
    var conversion = {
      0: 'Do',
      1: 'Du',
      2: 'Re',
      3: 'Ru',
      4: 'Mi',
      5: 'Fa',
      6: 'Fu',
      7: 'So',
      8: 'Su',
      9: 'La',
      10: 'Lu',
      11: 'Ti',
    };
  }

  return conversion[note];
}

var keyCodeToNote = {
  67: 41,
  86: 42,
  70: 43,
  51: 45,
  192: 47,
  49: 48, // C
  50: 49,
  81: 50,
  87: 51,
  65: 52,
  90: 53,
  88: 54,
  83: 55,
  68: 56,
  69: 57,
  82: 58,
  52: 59,
  53: 60, // C
  54: 61,
  84: 62,
  89: 63,
  71: 64,
  66: 65,
  78: 66,
  72: 67,
  74: 68,
  85: 69,
  73: 70,
  56: 71,
  57: 72, //C
  48: 73,
  79: 74,
  80: 75,
  76: 76,
  190: 77,
  191: 78,
  186: 79,
  222: 80,
  219: 81,
  221: 82,
  187: 83,
  8: 84, //C
  220: 86,
  189: 88,
  77: 89,
  188: 90,
  75: 91,
  55: 93,
};

noteToKeyCode = {};

for (prop in keyCodeToNote) {
  noteToKeyCode[keyCodeToNote[prop]] = parseInt(prop);
}

(function($) {
  var IS_IOS = navigator.userAgent.match(/(iPhone|iPad|webOs|Android)/i);
  $.fn.nodoubletapzoom = function() {
    if (IS_IOS)
      $(this).bind('touchstart', function preventZoom(e) {
        var t2 = e.timeStamp
          , t1 = $(this).data('lastTouch') || t2
          , dt = t2 - t1
          , fingers = e.originalEvent.touches.length;
        $(this).data('lastTouch', t2);
        if (!dt || dt > 500 || fingers > 1) return; // not double-tap
 
        e.preventDefault(); // double tap - prevent the zoom
        // also synthesize click events we just swallowed up
        $(this).trigger('click').trigger('click');
      });

    return this;
  };
})(jQuery);