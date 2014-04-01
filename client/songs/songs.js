var oldCount = 0;
var newCount = 0;
var songs;

Template.songs.created = function() {
  Session.set('noMoreSongs', false);
  Deps.autorun(function() {
    songs = SongFiles.find({}, {
      sort: {createdAt: -1},
      limit: Session.get('page') * 4,
    });
  });;
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

Template.songs.noMoreSongs = function() {
  return SongFiles.find().count() <= Session.get('page') * 4;
};
