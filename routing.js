////// next level after profile

Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading',
});

// When a page needs specific things from a song, we put it in data.song
// Do we still need Session's songId? May be for caching.
// When the replayer is used, we put the song info in data.replayerSong (because it may conflict with data.song)
Router.map(function() {
  // this.route('keyboard')
  this.route('songApi', {
    path: '/songApi/:_id',

    where: 'server',

    action: function() {
      var song = Songs.findOne(this.params._id);
      this.response.setHeader('Content-Type', 'application/json');
      this.response.write(JSON.stringify(song));
    },
  });

  this.route('songApi', {
    path: '/songsApi',

    where: 'server',

    action: function() {
      var songs = Songs.find({}, {
        fields: {
          _id: 1,
          createdAt: 1,
          title: 1,
        }
      }).fetch();
      this.response.setHeader('Content-Type', 'application/json');
      this.response.write(JSON.stringify(songs));
    },
  });

  this.route('editSong', {
    path: '/editSong/:_id',

    before: function() {
      this.subscribe('song', this.params._id).wait();
    },

    data: function() {
      var data = {};

      data.replayerSong = Songs.findOne(this.params._id);
      data.song = data.replayerSong;

      return data;
    }
  });

  this.route('upload');
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
      this.subscribe('song', this.params._id).wait();
    },

    data: function() {
      var data = {};

      data.replayerSong = Songs.findOne(this.params._id);
      data.song = data.replayerSong;

      return data;
    }
  });

  // this.route('oldGame', {
  //   path: '/game/:_id',
  //   before: function() {
  //     if (!Session.get('segmentLevel')) {
  //       Session.set('segmentLevel', 0)
  //     }
  //     Router.go('game', {_id: this.params._id, segmentLevel: Session.get('segmentLevel')});
  //   },
  // });

  this.route('game', {
    path: '/game/:_id',

    before: function() {
      this.subscribe('song', this.params._id).wait();
      this.subscribe('myInfo').wait();
    },

    data: function() {
      var data = {};

      data.song = Songs.findOne(this.params._id);

      return data;
    },

    // caching last game's songId; todo: check elsewhere, like profile, that this is defined
    after: function() {
      if (Session.get('songId') !== this.params._id) {
        // Session.set('segmentLevel', 0); // reset the game
        Session.set('songId', this.params._id);
      }

      // var level = parseInt( this.params.segmentLevel )
      // if (!isNaN(level)) {
      //   Session.set('segmentLevel', level)
      // }

      if (Meteor.userId()) {
        Meteor.call('updateLastVisitedGame', this.params._id, function(err){ 
          if(err) {
            alert(err.reason);
          }
        });
      }
    }
  });

  this.route('songs', {
    before: function() {
      this.subscribe('songIds');
      this.subscribe('mySongs');
    },
  });

  this.route('profile', {
    before: function() {
      this.subscribe('myProgresses');
      this.subscribe('song', Session.get('songId'));
      this.subscribe('songIds').wait();
    },

    data: function() {
      data = {};

      if (TempGames.complete) {
        data.replayerSong = TempGames.complete;
      }

      data.song = Songs.findOne(Session.get('songId'), {});

      return data;
    }
  });

  this.route('progress', {
    path: '/progress/:_id',

    before: function() {
      this.subscribe('progress', this.params._id).wait();
    },

    data: function() {
      var data = {};

      data.replayerSong = Progresses.findOne(this.params._id);

      return data;
    }
  });

  this.route('home', {
    path: '/',
    before: function() {
      // this.subscribe('myInfo').wait();
      // this.subscribe('songIds').wait();
    }
  });
});