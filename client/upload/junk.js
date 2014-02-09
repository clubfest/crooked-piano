  // // TODO: move this to the game level
  // smartDivide: function() {
  //   var debugSegment = {};

  //   // analyze each segment and see if we can divide it up further at appropriate points
  //   for (segmentId in this.notesBySegmentId) {
  //     var notes = this.notesBySegmentId[segmentId].notes;
  //     var GOOD_LENGTH = 80;
  //     var currShift = ''; // TODO: remove this hack for offsetting the trackId because id may conflict

  //     var count = 0;
  //     for (var i = 0; i < notes.length; i++) {
  //       var note = notes[i];
  //       count++;

  //       if (!debugSegment[note.segmentId]) {
  //         debugSegment[note.segmentId] = []
  //       }
  //       debugSegment[note.segmentId].push(note);

  //       // If not too close to the end for a long note after a lengthy segment 
  //       if (i < notes.length - GOOD_LENGTH &&
  //           notes[i+1].time - note.time > 2 * averageLength && 
  //           count > GOOD_LENGTH) {

  //         notes[i].isEnd = true; // TODO: refactor. This is used when gamifying
  //         // console.log(i);
  //         // console.log(notes.length);
  //         // console.log("===========");

  //         currShift += 's';
  //         count = 0;
  //       }
  //       // update segmentId everywhere
  //       note.segmentId += currShift;

        
  //     }
  //   }
  // },

  // smartSplit: function() {
  //   // Split any track that are too complicated into lower and upper tracks
  // },