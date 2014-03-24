Meteor.publish('songForks', function(songId) {
  return SongForks.find({});
});
// todo: add infinite scrolling
Meteor.publish('songFile', function(songId) {
  return SongFiles.find({_id: songId});
});

Meteor.publish('gameInfos', function() {
  return Songs.find({}, {
    fields: {
      title: 1,
      artist: 1,
      youtubeId: 1,
      isGamified: 1,
      createdAt: 1,
      playCount: 1,
    },
    sort: {createdAt: -1},
  });
});

Meteor.publish('song', function(songId) {
  return Songs.find({_id: songId});
});

Meteor.publish('songId', function(songId) {
  return Songs.find({_id: songId}, {
    fields: {
      notes: 0,
    }
  });
});

Meteor.publish('songNotes', function(songId) {
  return Songs.find({_id: songId}, {
    fields: {
      notes: 1,
    }
  });
});


Meteor.publish('songIds', function() {
  return Songs.find({}, {
    fields: {
      notes: 0,
      previewNotes: 0,
    }
  });
});

Meteor.publish('mySongIds', function() {
  return Songs.find({creatorId: this.userId}, {
    fields: {
      title: 1,
      artist: 1,
      youtubeId: 1,
      isGamified: 1,
      createdAt: 1,
      playCount: 1,
      creatorId: 1,
    },
    sort: {createdAt: -1},
  });
});

Meteor.publish('myProgressIds', function() {
  return Progresses.find({userId: this.userId}, {
    fields: {
      notes: 0
    },
    sort: {createdAt: -1},
  });
});

Meteor.publish('progress', function(progressId) {
  return Progresses.find({_id: progressId});
});

Meteor.publish('myInfo', function() {
  return Meteor.users.find({_id: this.userId}, {
    fields: {
      'lastVisitedGame': 1,
    }
  });
});

Meteor.publish('allFeedbacks', function() {
  return Feedbacks.find();
})