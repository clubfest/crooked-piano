
// db.songs.find({previewNotes: null}).snapshot().forEach( function(song) {
//  song.previewNotes = song.notes.slice(0,100);
//  db.songs.save(song);
// });

// db.songs.find({}).snapshot().forEach( function(song) {
//   var segmentIds = song.segmentIds;
//   for (var i = 0; i < segmentIds.length; i++) {
//     segmentIds[i] = parseInt(segmentIds[i]);
//   }
//   db.songs.save(song);
// });