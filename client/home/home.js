
Template.home.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    document.title = 'Crooked Piano | Play It Anywhere';

    $('<meta>', {
      name: 'description',
      content: 'With the Crooked Piano, you can can learn and play the piano anywhere.',
    }).appendTo('head');
  }
    
}

Template.home.events({
  'click #play-btn': function() {
    MIDI.noteOn(0, 60, 30);
  },
});

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

Template.home.loadProgress = function() {
  var loadProgress = Session.get('loadProgress') || 1;
  return Math.floor(loadProgress * 100 / 12);
}