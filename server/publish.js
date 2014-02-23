
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
    }
  });
});

Meteor.publish('mySongIds', function() {
  return Songs.find({creatorId: this.userId}, {
    fields: {
      notes: 0,
    }
  });
});

Meteor.publish('myProgressIds', function() {
  return Progresses.find({userId: this.userId}, {
    fields: {
      notes: 0
    },
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