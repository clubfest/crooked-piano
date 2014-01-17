
// Recorder = function() {
//   this.notes = [];
//   Session.set('isRecording', false);
//   Session.set('hasRecordedNotes', false);

//   this.init();
// };

// Recorder.prototype = {
//   init: function() {
//     this.connectKeyboardToRecorder();

//     this.onSave = function(songId) {
//       Router.go('addSegment', {_id: songId})
//     };
//   },

//   start: function() {
//     Session.set('isRecording', true);
//   },

//   stop: function() {
//     Session.set('isRecording', false);
//   },

//   clear: function() {
//     this.notes = [];
//     Session.set('hasRecordedNotes', false);
//   },

//   save: function() {
//     var self = this;
//     Meteor.call('createSong', self.notes, function(err, songId) {
//       if (err) {
//         alert(err.reason);
//       } else {
//         self.onSave(songId);
//       }
//     });
//   },

//   connectKeyboardToRecorder: function() {
//     var self = this;

//     $(window).on('keyboardDown.recorder', function(evt, data) {
//       console.log(data);
//       if (Session.get('isRecording') === true) {
//         data.isKeyboardDown = true;
//         self.notes.push(data);
//         Session.set('hasRecordedNotes', true);
//       }
//     })

//     $(window).on('keyboardUp.recorder', function(evt, data) {
//       if (Session.get('isRecording') === true) {
//         data.isKeyboardDown = false;
//         self.notes.push(data);
//       }
//     });
//   },

//   disconnectKeyboardToRecorder: function() {
//     $(window).off('keyboardDown.recorder' + this.id);
//     $(window).off('keyboardUp.recorder' + this.id);
//   }

// }