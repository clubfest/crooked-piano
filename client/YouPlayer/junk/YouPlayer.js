
// youPlayer = {
//   init: function() {
//     $(window).on('keyboardDown.youPlayer', this.judge);
//   },

//   destroy: function() {
//     $(window).off('keyboardDown.youPlayer');
//   },

//   setupSong: function() {
//     this.song = Session.get('song');
//     Session.set('segmentLevel', 0);
//     Session.set('playLevel', 0);

//     this.setupSolo();
//   },

//   setupLevel: function() {
//     Session.set('numCorrect', 0);
//     Session.set('numWrong', 0);
//     Session.set('playIndex', 0);

//     this.playNotes = [];
//     this.proximateNotes = [];
//     this.segmentId = this.song.segmentIds[Session.get('segmentLevel')];
//   },

//   judge: function(evt, data) {
//     var matchIdx = -1;

//     for (var i = 0; i < this.proximateNotes.length; i++) {
//       var note = this.proximateNotes[i];
//       if (data.keyCode === note.keyCode) {
//         matchIdx = i;
//         break ;
//       }
//     }

//     if (matchIdx > -1) {
//       this.incrementScore();
//       this.proximateNotes.splice(matchIdx, 1);
//       this.undisplayNote(note);
//       this.updateProximateNotes();
//       if (this.proximateNotes.length === 0) {
//         this.setupNextLevel();
//       }
//     } else {
//       this.decrementScore();
//     }
//   },

//   incrementScore: function() {
//     Session.set('numCorrect', Session.get('numCorrect') + 1);
//   },

//   decrementScore: function() {
//     Session.set('numWrong', Session.get('numWrong') + 1);
//   },

//   newGame: function() {
//     this.playIndex = 0;
//     this.playNotes = [];
//     this.segmentId = this.song.segmentIds[this.segmentLevel];
//     this.proximateNotes = []; // the notes the user need to play currently
//     this.numWrong = 0;
//     this.numCorrect = 0;
//   },

//   setupSolo: function() {
//     this.newGame();
//     for (var i = 0; i < this.song.notes.length; i++) {
//       var note = this.song.notes[i];
//       if (note.segmentId === this.segmentId) {
//         if (note.isKeyboardDown === true) {
//           this.playNotes.push(note);        
//         }
//       }
//     }
//     ////////////////////////////////
//     this.updateProximateNotes();
//   },

//   setupNextLevel: function() {
//   },

//   updateProximateNotes: function() {
//     // Add new note if empy or if the first note's time different by less than 100 ms
//     while(this.proximateNotes.length === 0) {
//       if (this.playIndex === this.playNotes.length) {
//         return ;
//       }

//       var proximateNote = this.playNotes[this.playIndex]
//       if (proximateNote.segmentId === this.segmentId) {
//         this.proximateNotes.push(proximateNote);
//         this.displayNote(proximateNote);
//         this.playIndex++;
//       }
//     }

//     var startTime = this.proximateNotes[0].time;
//     while (this.playIndex < this.playNotes.length) {
//       var note = this.playNotes[this.playIndex];
//       if (note.time - startTime < 100) {
//         this.playIndex++;

//         if (note.segmentId === this.segmentId) {
//           this.proximateNotes.push(note);
//           this.displayNote(note);
//         }
//       } else {
//         return ;
//       }
//     }
//   },

//   displayNote: function(note) {
//     $('[data-key-code='+note.keyCode+']').addClass('first-cluster');
//   },

//   undisplayNote: function(note) {
//     $('[data-key-code='+note.keyCode+']').removeClass('first-cluster');
//   },
// }