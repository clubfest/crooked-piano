
Template.songs.gamifiedSongs = function() {
  return Songs.find({isGamified: true});
}

Template.songs.mySongs = function() {
  return Songs.find({creatorId: Meteor.userId()});
}

Template.songs.events({
  'click .delete-btn': function(evt) {
    var res = confirm('Are you sure?');

    if (!res) return;
    
    var songId = evt.currentTarget.dataset.songId;

    Meteor.call('removeSong', songId, function(err) {
      if (err) alert(err.reason);
    })
  },
})
