
// Template.sheet.rendered = function() {

  
// }

// var notes = [
//       {
//         beat: 0,
//         duration: 1,
//         note: 60,
//       },
//       {
//         beat: 0,
//         duration: 1,
//         note: 64,
//       },
//       {
//         beat: 1,
//         duration: 1,
//         note: 59,
//       },
//       {
//         beat: 1,
//         duration: 1,
//         note: 62,
//       },
//       {
//         beat: 2,
//         duration: 2,
//         note: 59,
//       },
//       {
//         beat: 2,
//         duration: 2,
//         note: 58,
//       },
//       {
//         beat: 13,
//         duration: 2,
//         note: 57,
//       },
//       {
//         beat: 14,
//         duration: 2,
//         note: 58,
//       },
//       {
//         beat: 18,
//         duration: 2,
//         note: 59,
//       },
//       {
//         beat: 18,
//         duration: 2,
//         note: 83,
//       },
//     ];

// function drawNotes(notes) {
//   notes = [
//     {
//       beat: 0,
//       duration: 16,
//       note: 60,
//     },
//     {
//       beat: 0,
//       duration: 16,
//       note: 64,
//     },
//     {
//       beat: 16,
//       duration: 16,
//       note: 59,
//     },
//     {
//       beat: 16,
//       duration: 16,
//       note: 62,
//     },
//   ];

//   var i = notes.length - 1;
//   var BEATS_PER_LINE = 64;

//   while (i >= 0) {
//     var currentNote = notes[i];
//     var lastBeat = currentNote.beat;
//     var currentNotes = [currentNote];
//     var vexNotes = [];
//     i--;

//     while (i >= 0) {
//       currentNote = notes[i];
//       if (currentNote.beat === lastBeat) {
//         currentNotes.push(currentNote);
//       } else { 
//         break;
//       }
//     }

//     vexNotes.push(notesToVexNotes(notes));

//     while (i < notes.length) {
//       currentNote = notes[i];
//       if (currentNote.beat - firstBeat < BEATS_PER_LINE) {
//         currentNotes.push(currentNote);
//         i++;
//       } else {
//         break ;
//       }
//     }

//     var vexNotes = notesToVexNotes(notes);
//   }

// }

// function notesToVexNotes(notes) {
//   for (var i = 0; i < notes.length; i++) {

//   }
// }