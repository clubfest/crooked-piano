
Router.map(function() {
  this.route('createSong', {
    path: '/',
    before: function() {    },
  });

  this.route('addSegment', {
    path: '/addSegment/:_id',
    data: function() {
      var song = Songs.findOne(this.params._id);
      Session.set('song', song);
      return song;
    },
  });

  this.route('game', {
    path: '/game/:_id',
    data: function() {
      var song = Songs.findOne(this.params._id);
      Session.set('song', song);
      return song;
    },
  });

  this.route('songs')
});