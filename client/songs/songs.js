

Template.songs.gamifiedSongs = function() {
  return Songs.find({isGamified: true}, {sort: {createdAt: -1}});
}

Template.songs.mySongs = function() {
  return Songs.find({creatorId: Meteor.userId()}, {sort: {createdAt: -1}});
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

  'click .gamified-item': function(evt) {
    var _id = evt.currentTarget.dataset.gameId;
    Router.go('game', {_id: _id});
  },

  'click .my-item': function(evt) {
    var _id = evt.currentTarget.dataset.gameId;
    Router.go('addSegment', {_id: _id});
  }
});
