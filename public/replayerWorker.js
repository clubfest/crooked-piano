
// var self
// if (typeof simpleReplayer !== 'undefined') {
//   self = simpleReplayer;
// }

// var currIndex = Session.get('replayerIndex');
// var note = self.notes[currIndex];

// // updated note's info
// note.isFromReplayer = true;

// if (note.isKeyboardDown === true) {
//   $(window).trigger('keyboardDown', note);
// } else {
//   $(window).trigger('keyboardUp', note);
// }

// if (currIndex >= self.notes.length - 1) {
//   Session.set('isReplaying', false);
// } else {
//   var nextNote = self.notes[currIndex + 1];
//   var lag = ((new Date).getTime() - self.firstNoteStartTime) - (note.time - self.firstNoteTime);

//   self.timeout = window.setTimeout(function() {
//     Session.set('replayerIndex', currIndex + 1);
//     self._play();
//   // },  (nextNote.time - note.time) / (Session.get('playSpeed') || 1));
//   },  nextNote.time - note.time - lag);
// }