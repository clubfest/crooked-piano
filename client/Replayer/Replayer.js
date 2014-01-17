
// Replayer = function() {
//   this.notes = [];
//   this.timeout = null;

//   this.reset();
// };

// Replayer.prototype = {
//   init: function(notes) {
//     this.notes = notes;
//     this.reset();
//   },

//   reset: function() {
//     Session.set('isReplaying', false);
//     Session.set('replayerIndex', 0);
//   },

//   play: function() {
//     Session.set('isReplaying', true);
//     if (Session.get('replayerIndex') >= this.notes.length - 1) {
//       Session.set('replayerIndex', 0)
//     }
//     this._play();
//   },

//   pause: function() {
//     window.clearTimeout(this.timeout);
//     Session.set('isReplaying', false);
//   },

//   _play: function() {
//     var self = this;
//     var currIndex = Session.get('replayerIndex');
//     var note = this.notes[currIndex];

//     // updated note's info
//     note.isFromReplayer = true;

//     if (note.isKeyboardDown === true) {
//       $(window).trigger('keyboardDown', note);
//     } else {
//       $(window).trigger('keyboardUp', note);
//     }

//     if (currIndex >= this.notes.length - 1) {
//       Session.set('isReplaying', false);
//     } else {
//       this.timeout = window.setTimeout(function() {
//         Session.set('replayerIndex', currIndex + 1);
//         self._play();
//       }, self.notes[currIndex + 1].time - note.time);
//     }
      
//   }
// }
