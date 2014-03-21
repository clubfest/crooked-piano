
SongFiles = new Meteor.Collection('songFiles');

Meteor.methods({
  'createSongFile': function(hash) {
    var songId = SongFiles.insert(hash);
    return songId;
  }
})