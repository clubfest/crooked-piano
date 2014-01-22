
Router.map(function() {
  this.route('createSong');

  this.route('feedback', {
    before: function() {
      this.subscribe('allFeedbacks');
    },

    data: function() {
      return Feedbacks.find({}, {sort: {createdAt: -1}});
    }
  });

  this.route('addSegment', {
    path: '/addSegment/:_id',
    before: function() {
      this.subscribe('mySongs')
    },

    data: function() {
      var song = Songs.findOne(this.params._id);
      Session.set('replayerSong', song);
      return song;
    },
  });

  this.route('game', {
    path: '/game/:_id',
    before: function() {
      this.subscribe('song', this.params._id);
      this.subscribe('myInfo')
    },

    data: function() {
      var song = Songs.findOne(this.params._id);
      Session.set('song', song);
      return song;
    },

    after: function() {
      var song = Session.get('song');
      if (Meteor.userId() && song) {
        Meteor.call('updateLastVisitedGame', song._id);
      }
    }
  });

  this.route('songs');

  this.route('profile', {
    before: function() {
      this.subscribe('myProgresses');
    }
  });

  this.route('progress', {
    path: '/progress/:_id',

    before: function() {
      this.subscribe('progress', this.params._id);
      Session.set('replayerSong', Progresses.findOne(this.params._id));
    },

    data: function() {
      return Session.get('replayerSong');
    },
  })

  this.route('home', {
    path: '/',
    before: function() {
      this.subscribe('myInfo').wait();
      this.subscribe('firstSong').wait();
    },
    after: function() {
      // Check the user's history or pick the earliest song
      if (this.ready()) {
        var user = Meteor.user();
        if (user && user.lastVisitedGame) {
          Songs.findOne(user.lastVisitedGame);
          Router.go('game', {_id: user.lastVisitedGame});

        } else {
          var song = Songs.findOne({isGamified: 1}, {
            sort: {createdAt: 1},
            fields: {_id: 1}
          });
          
          if (song && song._id) {
            Router.go('game', {_id: song._id});
          } else {
            // all else fails
            Router.go('createSong');
          }
        }
      }
    }
  })
});