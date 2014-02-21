
Template.home.songId = function() {
  var user = Meteor.user();
  
  if (user && user.lastVisitedGame) {
    var song = Songs.findOne(user.lastVisitedGame)
    if (song) {
      return user.lastVisitedGame;
    }
  }

  var song = Songs.findOne({isGamified: true}, {
    fields: {_id: 1},
  });

  if (song) {
    return song._id
  } 
}

Template.home.events({
  'click #play-btn': function() {
    MIDI.noteOn(0, 60, 60);
  }
});

Template.home.loadProgress = function() {
  var loadProgress = Session.get('loadProgress') || 1;
  return Math.floor(loadProgress * 100 / 12);
}