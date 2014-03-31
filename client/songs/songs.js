var oldCount = 0;
var newCount = 0;
var songs;

Template.songs.created = function() {
  Session.set('noMoreSongs', false);
  songs = this.data.songs;
}

Template.songs.gamifiedSongs = function() {
  return songs;
}



Template.songs.events({
  'click .gamified-item': function(evt) {
    var _id = evt.currentTarget.dataset.gameId;
    Router.go('game', {_id: _id});
  },
  'click #load-more-games': function(evt) {
    newCount = SongFiles.find().count();  
    if (oldCount === newCount) {
      Session.set('noMoreSongs', true);
    } else {
      oldCount = newCount;
    }
    Session.set('page', Session.get('page') + 1);
  },

});

UI.registerHelper('noMoreSongs', function() {
  return Session.get('noMoreSongs');
})
