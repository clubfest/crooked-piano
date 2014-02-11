
Template.profile.nextSongId = function() {
  var song = this.song;

  if (song && song.createdAt) {
    var nextSong = Songs.findOne({createdAt: {$lt: song.createdAt}}, {
      fields: {_id: 1},
      sort: {createdAt: -1}
    });

    if (nextSong) {
      return nextSong._id;
    }
    // else, there is no song, so just show the create button
  }
  return Songs.findOne({}, {
    sort: {createdAt: -1}, 
    fields: {_id: 1}
  })._id;

}

Template.profile.events({
  'click #next-btn': function(evt, tmpl) {
    if (Meteor.userId() && TempGames.complete) {
      Meteor.call('saveTempGamesToUser', TempGames.complete, function(err){
        if (err) alert(err.reason);
      });
    }

    // if it's not the end of the song, get back to it
    // else go to the next one in date
    
    var nextSongId = evt.currentTarget.dataset.nextSongId
    
    if (this.song && Session.get('segmentLevel') < this.song.segmentIds.length) {
      Router.go('game', {_id: this.song._id, segmentLevel: Session.get('segmentLevel')}); 

    } else {
      Session.set('playLevel', 0);
      Session.set('segmentLevel', 0);
      Router.go('game', {_id: nextSongId, segmentLevel: Session.get('segmentLevel')});
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
  // find the next song if the current song is defined
  var song = this.data.replayerSong;

  if (typeof song !== 'undefined') {
    var nextSong = Songs.findOne({createdAt: {$gt: song.createdAt}}, {sort: {createdAt: 1}});

    if (!nextSong) {
      nextSong = Songs.findOne({}, {sort: {createdAt: 1}});
    }

    Session.set('nextSong', nextSong);
  }
  
}

Template.profile.hasSong = function() {
  return TempGames.complete;
}


Template.profile.progresses = function() {
  return Progresses.find({userId: Meteor.userId()});
}

Handlebars.registerHelper('beautifyDate', function(date) {
  if (!date) return 'T.B.A.';

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