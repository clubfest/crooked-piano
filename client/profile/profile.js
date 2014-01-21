// var nextSong;

Template.profile.events({
  'click #next-btn': function() {
    if (Meteor.userId()) {
      Meteor.call('saveTempGamesToUser', TempGames.complete, function(err){
        if (err) alert(err.reason);
      });
    }

    // if it's not the end of the song, get back to it
    // else go to the next one in date
    
    var song = Session.get('song');
    var nextSong = Session.get('nextSong');

    if (typeof song === 'undefined') {
      Router.go('home');

    } else if (Session.get('segmentLevel') >= song.segmentIds.length) {
      Session.set('playLevel', 0);
      Session.set('segmentLevel', 0);
      Router.go('game', {_id: nextSong._id})

    } else {
      Router.go('game', {_id: song._id});
    }
  },

  'click #submit-feedback': function() {
    var $input = $('#feedback-input');
    
    Meteor.call('submitFeedback', $input.val(), function(err) {
      if (err) {
        alert(err.reason);
      } else {
        $input.val('');  
      }
    });
  }
});

Template.profile.created = function() {
  if (TempGames.complete) {
    Session.set('replayerSong', TempGames.complete);
  }

  // find the next song if the current song is defined
  var song = Session.get('song');

  if (typeof song !== 'undefined') {
    nextSong = Songs.findOne({createdAt: {$gt: song.createdAt}}, {sort: {createdAt: 1}});

    if (!nextSong) {
      nextSong = Songs.findOne({}, {sort: {createdAt: 1}});
    }

    Session.set('nextSong', nextSong);
  }
  
}

Template.profile.hasSong = function() {
  return typeof Session.get('replayerSong') !== 'undefined';
}


Template.profile.progresses = function() {
  return Progresses.find({userId: Meteor.userId()});
  ///////////// change user's progress to an array
}

Handlebars.registerHelper('beautifyDate', function(date) {
  var current = new Date();
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();
  var ret = month+'/'+day;
  if (year!==current.getFullYear()){
    ret += '/'+year
  }
  return ret;
})