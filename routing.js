
Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading',
});

// Router.before(function() {
//   console.log('before')
//   if (! this.ready())
//     this.render('loading');
// });

// When the replayer is used, we put the song info in data.replayerSong (because it may conflict with data.song)
Router.map(function() {
  this.route('gamify', {
    path: '/gamify/:url',
    action: function() {
      var self = this;

      self.render('loading');

      Meteor.call('downloadMidi', this.params.url, function(err, songId) {
        if (err) {
          alert(err.reason + '\nTry to upload the file from your computer.');
          // console.log(err.reason);
          self.render('upload');
        } else {
          Router.go('editSong', {_id: songId});
        }
      });
      
    }
  });

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

  this.route('feedback', {
    before: function() {
      this.subscribe('allFeedbacks');
    },

    data: function() {
      return Feedbacks.find({}, {sort: {createdAt: -1}});
    }
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

  this.route('game', {
    path: '/game/:_id',

    before: function() {
      console.log('game before')
      this.subscribe('songId', this.params._id).wait();
      this.subscribe('songNotes', this.params._id);
    },

    data: function() {
      console.log('game data')

      // var data = {};

      // data.song = Songs.findOne(this.params._id);

      // return data;
    },

    // caching last game's songId; todo: check elsewhere, like profile, that this is defined
    after: function() {
      if (Session.get('songId') !== this.params._id) {
        Session.set('songId', this.params._id);
      }
    }
  });

  this.route('songs', {
    before: function() {
      this.subscribe('gameInfos');
    },
  });

  this.route('profile', {
    before: function() {
      this.subscribe('myProgressIds');
      this.subscribe('mySongIds');
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
      GAnalytics.pageview();
    },
  });

  this.route('chart')
});