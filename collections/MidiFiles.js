
SongFiles = new Meteor.Collection('songFiles');

Meteor.methods({
  'createSongFile': function(fileName, midi) {
    SongFiles.insert({
      fileName: fileName,
      midi: midi,
    });
  }
})