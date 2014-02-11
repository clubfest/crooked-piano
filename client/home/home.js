
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