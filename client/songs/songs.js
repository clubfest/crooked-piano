

Template.songs.gamifiedSongs = function() {
  return Songs.find(/*{isGamified: true}*/);
}



Template.songs.events({
  'click .gamified-item': function(evt) {
    var _id = evt.currentTarget.dataset.gameId;
    Router.go('game', {_id: _id});
  },

});
