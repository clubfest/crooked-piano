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
      Session.set('songId', this.params._id);

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
      this.subscribe('mySongs')
    },
  });

  this.route('profile', {
    before: function() {
      this.subscribe('myProgresses');
      this.subscribe('song', Session.get('songId'));
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
      this.subscribe('myInfo').wait();
      this.subscribe('songIds').wait();
    }
  });
});