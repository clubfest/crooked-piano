// var fs = require('fs');
// var SheetDrawer = require('../client/Sheet/SheetDrawer.js');


// describe('SheetDrawer', function() {
//   describe('loadNotesInMeasure', function() {
//     it('loads notes from beat 0 up to but excluding 4', function() {
//       var notes = [{
//         timeInBeats: 0,
//         durationInBeats: 2
//       }, {
//         timeInBeats: 2,
//         durationInBeats: 4
//       }, {
//         timeInBeats: 4,
//         durationInBeats: 2
//       }];

//       SheetDrawer.initVariables(notes);

//       SheetDrawer.loadMeasures();

//       expect(SheetDrawer.measures).toEqual([notes.slice(0, 2), notes.slice(2,3)]);

//       SheetDrawer.loadVoices();

//       expect(SheetDrawer.voices).toEqual([])
//     });
//   });
// })
//       