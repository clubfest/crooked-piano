
// Template.home.created = function() {
//   Deps.autorun(function() {})
// }

Template.home.songId = function() {
  var user = Meteor.user();
  
  if (user && user.lastVisitedGame) {
    var song = Songs.findOne(user.lastVisitedGame)
    if (song) {
      return user.lastVisitedGame;
    }
  }

  return Songs.findOne({isGamified: true}, {
    sort: {createdAt: 1},
    fields: {_id: 1},
  })._id; 
}