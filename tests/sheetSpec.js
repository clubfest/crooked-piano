var fs = require('fs');
var SheetDrawer = require('../client/Sheet/SheetDrawer.js');


describe('SheetDrawer', function() {
  describe('loadMeasures', function() {
    it('splits notes up correctly', function() {
      SheetDrawer.initVariables(notes);

      SheetDrawer.loadMeasures();

      expect(SheetDrawer.measures[0][0].timeInBeats).toEqual(notes[0].timeInBeats);
      expect(SheetDrawer.measures[0][1].timeInBeats).toEqual(notes[1].timeInBeats);
      expect(SheetDrawer.measures[0][2].timeInBeats).toEqual(notes[2].timeInBeats);
      expect(SheetDrawer.measures[0][3].timeInBeats).toEqual(notes[3].timeInBeats);

      expect(SheetDrawer.measures[1][0].timeInBeats).toEqual(4);
      expect(SheetDrawer.measures[1][0].durationInBeats).toEqual(2);
      expect(SheetDrawer.measures[1][1].durationInBeats).toEqual(1);

      SheetDrawer.loadVoices(SheetDrawer.measures[0]);

      expect(SheetDrawer.voices[1][0].timeInBeats).toEqual(3);
    });
  });
});


var notes = [{
  timeInBeats: 0,
  durationInBeats: 1
}, {
  timeInBeats: 1,
  durationInBeats: 1
}, {
  timeInBeats: 2,
  durationInBeats: 4
}, {
  timeInBeats: 3,
  durationInBeats: 2,
}];
      