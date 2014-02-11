// TODO: get rid of popSongs
// Meteor.publish('popSongs', function() {
//   return Songs.find({isGamified: true});
// });

Meteor.publish('song', function(songId) {
  return Songs.find({_id: songId});
});

Meteor.publish('songIds', function() {
  return Songs.find({}, {
    fields: {
      title: 1,
      creatorId: 1,
      createdAt: 1,
      isGamified: 1,
    }
  });
});


Meteor.publish('mySongs', function() {
  return Songs.find({creatorId: this.userId});
});

Meteor.publish('myProgresses', function() {
  return Progresses.find({userId: this.userId}, {
    fields: {notes: 0},
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