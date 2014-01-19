
// Keyboard = function() {
//   this.channel = 0;
//   this.velocity = 70;
//   this.shift = 0;
//   this.hasPedal = true;

//   this.init();
//   return this;
// }

// Keyboard.prototype = {
//   init: function() {
//     this.connectKeyToKeyboard();
//     this.connectKeyboardToDisplay();
//     // this.connectKeyboardToSound();
//   },

//   connectKeyToKeyboard: function() {
//     var self = this;

//     $(window).on('keydown.keyboard', function(evt) {
//       var keyCode = fixKeyCode(evt.keyCode);
//       var note = convertKeyCodeToNote(keyCode);

//       if (typeof note !== "undefined") {
//         note = self.adjustShift(note);
//       } else {
//         self.adjustSettings(keyCode);
//       }

//       $(window).trigger('keyboardDown', {
//         time: new Date().getTime(),
//         keyCode: keyCode,
//         note: note,
//         channel: self.channel,
//         velocity: self.velocity,
//       });
//     });

//     $(window).on('keyup.keyboard', function(evt) {
//       var keyCode = fixKeyCode(evt.keyCode);
//       var note = convertKeyCodeToNote(keyCode);

//       if (typeof note !== "undefined") {
//         note = self.adjustShift(note);
//       }

//       $(window).trigger('keyboardUp', {
//         time: new Date().getTime(),
//         keyCode: keyCode,
//         note: note,
//         channel: self.channel,
//         velocity: self.velocity,
//       });
//     });
//   },

//   connectKeyboardToDisplay: function() {
//     var self = this;

//     $(window).on('keyboardDown.display', function(evt, data) {
//       if (data.channel === self.channel) {
//         $('[data-key-code="' + data.keyCode + '"]').addClass('keydown');
//       }
//     });

//     $(window).on('keyboardUp.display', function(evt, data) {
//       if (data.channel === self.channel) {
//         $('[data-key-code="' + data.keyCode + '"]').removeClass('keydown');
//       }
//     });
//   },

//   adjustShift: function(note) {
//     note += this.shift;
//     return note;
//   },

//   adjustSettings: function(keyCode) {

//   },
// }

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

// var keyCodeToNote = {
//   67: 43,
//   86: 44,
//   70: 45,
//   51: 47,
//   192: 49,
//   49: 50, // C
//   50: 51,
//   81: 52,
//   87: 53,
//   65: 54,
//   90: 55,
//   88: 56,
//   83: 57,
//   68: 58,
//   69: 59,
//   82: 60,
//   52: 61,
//   53: 62, // C
//   54: 63,
//   84: 64,
//   89: 65,
//   71: 66,
//   66: 67,
//   78: 68,
//   72: 69,
//   74: 70,
//   85: 71,
//   73: 72,
//   56: 73,
//   57: 74, //C
//   48: 75,
//   79: 76,
//   80: 77,
//   76: 78,
//   190: 79,
//   191: 80,
//   186: 81,
//   222: 82,
//   219: 83,
//   221: 84,
//   187: 85,
//   8: 86, //C
//   220: 88,
//   189: 90,
//   77: 91,
//   188: 92,
//   75: 93,
//   55: 95,
// }