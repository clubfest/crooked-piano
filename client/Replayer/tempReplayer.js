// // This is a replayer that loads notes from the TempGame

// Template.tempReplayer.rendered = function() {
//   var song;
  
//   simpleReplayer.init()
//   if (!this.rendered) {
//     this.rendered = true;

//     Deps.autorun(function() {
//       // update slider when notes song has switched or notes been added
//       ///////////////////// TODO: should I load the entire song into the session variable
//       //////////// May be only for the addSegmentReplayer and have the session variable destroyed when you leave the page
//       var songId = Session.get('replayerSongId');

//       song = Songs.findOne(songId, {fields: {notes: 1}});
      
//       simpleReplayer.init(song.notes);

//       $('.slider').slider({
//         range: "min",
//         min: 0,
//         max: song.notes.length - 1,
//         value: 0,
//       });
//     });

//     Deps.autorun(function() {
//       // update slider when replayer starts
//       $('.slider').slider({
//         range: "min",
//         min: 0,
//         max: song.notes.length - 1,
//         value: Session.get('replayerIndex'),
//       });
//     })
    
//     // user changing the slider
//     $('.slider').slider({
//       slide: function(evt, ui) {

//         Session.set('replayerIndex', ui.value);

//         // if slider is moved while we are replaying, need to restart at new position
//         if (Session.get('isReplaying') == true) {
//           simpleReplayer.pause();
//           simpleReplayer.play();
//         } else {
//           simpleReplayer.play();
//         }
//       }
//     });
//   }
// }
