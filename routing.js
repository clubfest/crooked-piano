
Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading',
});

// Router.onBeforeAction('loading');
// Router.onBeforeAction('dataNotFound')

// When the replayer is used, we put the song info in data.replayerSong (because it may conflict with data.song)
Router.map(function() {
  this.route('songFile', {
    path: '/songFile/:_id',
    onBeforeAction: function() {
      GAnalytics.pageview();
    },
    waitOn: function() {
      return [this.subscribe('mySongFile', this.params._id)];
    },
    
    data: function() {
      var data = {};
      data.song = SongFiles.findOne(this.params._id);

      return data;
    },

    action: function() {
      if (this.ready()) {
        this.render('songFile');
      } else {
        this.render('loading');
      }
    }
  });

  // this.route('metronome');
  // this.route('sheet');

  this.route('gamify', {
    path: '/gamify/:url',
    onBeforeAction: function() {
      GAnalytics.pageview();
    },
    action: function() {
      var self = this;
      if (!Meteor.userId()) {
        alert('You are need to sign in to upload songs.');
        self.render('upload');
      } else {
        self.render('loading');

        Meteor.call('downloadMidi', this.params.url, function(err, songId) {
          if (err) {
            alert(err.reason + '\nTry uploading the file from your computer.');
            // console.log(err.reason);
            self.render('upload');
          }
          // else you should be routed to the song
        });
      }
    }
  });

  this.route('songApi', {
    path: '/songApi/:_id',
    where: 'server',
    action: function() {
      var song = SongFiles.findOne(this.params._id);
      this.response.setHeader('Content-Type', 'application/json');
      this.response.write(JSON.stringify(song));
    },
  });

  this.route('songApi', {
    path: '/songsApi/:num',
    where: 'server',
    action: function() {
      var songs = SongFiles.find({}, {
        fields: {
          _id: 1,
          createdAt: 1,
          title: 1,
        },
        limit: 20,
        skip: parseInt(this.params.num) * 20,
      }).fetch();
      this.response.setHeader('Content-Type', 'application/json');
      this.response.write(JSON.stringify(songs));
    },
  });

  this.route('upload');

  this.route('feedback', {
    onBeforeAction: function() {
      this.subscribe('allFeedbacks');
    },

    data: function() {
      return Feedbacks.find({}, {sort: {createdAt: -1}});
    }
  });

  this.route('game', {
    path: '/game/:_id',

    onBeforeAction: function() {
      GAnalytics.pageview();
    },

    waitOn: function() {
      return [
        this.subscribe('songFile', this.params._id),
        // this.subscribe('songNotes', this.params._id)
      ];
    },

    action: function() {
      if (this.ready()) {
        this.render('game');        
      } else {
        this.render('loading');
      }
    },

    data: function() {
      var data = {};
      data.song = SongFiles.findOne(this.params._id);

      return data;
    },
  });

  this.route('songs', {
    onBeforeAction: function() {
      Session.set('page', 1);
      GAnalytics.pageview();
    },

    waitOn: function() {
      return [this.subscribe('songFilesInfo', {page: Session.get('page')})];
    },

    data: function() {
      data = {};
      data.songs = SongFiles.find({}, {sort: {createdAt: 1}});

      return data;
    },
  });

  this.route('profile', {
    onBeforeAction: function() {
      // this.subscribe('myProgressIds');
      // this.subscribe('mySongIds');
      Session.set('page', 1);
      GAnalytics.pageview();
    },

    waitOn: function() {
      return [this.subscribe('mySongFilesInfo', {page: Session.get('page')})];
    },
    
    data: function() {
      data = {};
      data.songs = SongFiles.find({}, {sort: {createdAt: -1}});

      // if (TempGames.complete) {
      //   data.replayerSong = TempGames.complete;
      // }

      // data.song = Songs.findOne(Session.get('songId'), {});

      return data;
    }
  });

  // this.route('progress', {
  //   path: '/progress/:_id',

  //   onBeforeAction: function() {
  //     this.subscribe('progress', this.params._id).wait();
  //     GAnalytics.pageview();
  //   },

  //   data: function() {
  //     var data = {};

  //     data.replayerSong = Progresses.findOne(this.params._id);

  //     return data;
  //   }
  // });

  this.route('home', {
    path: '/',
    onBeforeAction: function() {
      GAnalytics.pageview();
    },
  });

});