// IS_IOS = navigator.userAgent.match(/(iPhone|iPad|webOs|Android)/i);

Guitar = {
  channel: 0,
  velocity: 80,
  shift: 0,
  hasPedal: true,

  connectMouseToKeyboard: function() {
    var self = this;

    $('.key').off('mousedown.guitar-keyboard');
    $('.key').on('mousedown.guitar-keyboard', function(evt){

      var note = parseInt($(evt.target).closest('.key').data('note'));
      // var note = convertKeyCodeToNote(keyCode);

      // if (typeof note !== "undefined") {
        note = self.adjustShift(note);
        $(window).trigger('keyboardDown', {
          time: new Date().getTime(),
          // keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });
      // }
    });

    $('.key').off('mouseup.guitar-keyboard');
    $('.key').on('mouseup.guitar-keyboard', function(evt) {
      var note = parseInt($(evt.target).closest('.key').data('note'));
      // var note = convertKeyCodeToNote(keyCode);

      // if (typeof note !== "undefined") {
        note = self.adjustShift(note);
        $(window).trigger('keyboardUp', {
          time: new Date().getTime(),
          // keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });
      // }
    });
  },

  connectTouchToKeyboard: function() {
    var self = this;

    $('.key').off('touchstart.guitar-keyboard');
    $('.key').on('touchstart.guitar-keyboard', function(evt){
      var note = parseInt($(evt.target).closest('.key').data('note'));
      // var note = convertKeyCodeToNote(keyCode);

      // if (typeof note !== "undefined") {
        note = self.adjustShift(note);
        $(window).trigger('keyboardDown', {
          time: new Date().getTime(),
          // keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });
      // }
    });

    $('.key').off('touchend.guitar-keyboard');
    $('.key').on('touchend.guitar-keyboard', function(evt) {
      var note = parseInt($(evt.target).closest('.key').data('note'));
      // var note = convertKeyCodeToNote(keyCode);

      // if (typeof note !== "undefined") {
        note = self.adjustShift(note);
        $(window).trigger('keyboardUp', {
          time: new Date().getTime(),
          // keyCode: keyCode,
          note: note,
          channel: self.channel,
          velocity: self.velocity,
        });
      // }
    });
  },

  
  connectKeyboardToGuitarDisplay: function() {
    var self = this;

    $(window).off('keyboardDown.guitar-display');
    $(window).on('keyboardDown.guitar-display', function(evt, data) {
      if (data.channel === self.channel && !data.playedByComputer) {
        var dom = $('[data-note="' + data.note + '"]');
        dom.addClass('keydown').html('<span>'+noteToName(data.note, Session.get('isAlphabetNotation'))+'</span>');
      }
    });

    $(window).off('keyboardUp.guitar-display');
    $(window).on('keyboardUp.guitar-display', function(evt, data) {
      if (data.channel === self.channel) {
        var dom = $('[data-key-code="' + data.note + '"]');
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

// ///// init
// simpleKeyboard.connectKeyToKeyboard();
// simpleKeyboard.connectKeyboardToDisplay();
Guitar.connectKeyboardToGuitarDisplay();


// ////// helpers
// function fixKeyCode(keyCode) {
//   // firefox incompatibility
//   if (keyCode === 59) {
//     keyCode = 186;
//   } else if (keyCode === 61) {
//     keyCode = 187;
//   } else if (keyCode === 173) {
//     keyCode = 189;
//   }

//   return keyCode
// }

// function convertKeyCodeToNote(keyCode) {
//   return keyCodeToNote[keyCode];
// }

// noteToName = function(note, alphabet) {
//   note = (note - 60) % 12;

//   if (note < 0) {
//     note += 12;
//   }

//   if (alphabet) {
//     if (1 || Session.get('isSharp')) {
//       var conversion = {
//         0: 'C',
//         1: 'C\u266F',
//         2: 'D',
//         3: 'D\u266F',
//         4: 'E',
//         5: 'F',
//         6: 'F\u266F',
//         7: 'G',
//         8: 'G\u266F',
//         9: 'A',
//         10: 'A\u266F',
//         11: 'B',
//       };
//     } else {
//       var conversion = {
//         0: 'C',
//         1: 'D\u266D',
//         2: 'D',
//         3: 'E\u266D',
//         4: 'E',
//         5: 'F',
//         6: 'G\u266D',
//         7: 'G',
//         8: 'A\u266D',
//         9: 'A',
//         10: 'B\u266D',
//         11: 'B',
//       };
//     }


//   } else {
//     var conversion = {
//       0: 'Do',
//       1: 'Du',
//       2: 'Re',
//       3: 'Ru',
//       4: 'Mi',
//       5: 'Fa',
//       6: 'Fu',
//       7: 'So',
//       8: 'Su',
//       9: 'La',
//       10: 'Lu',
//       11: 'Ti',
//     };
//   }

//   return conversion[note];
// }
