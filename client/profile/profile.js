var oldCount = 0;
var newCount = 0;
var songs;
var songsHandle;

Template.profile.created = function() {
  Session.set('noMoreSongs', false);
  // songs = this.data.songs;
  Deps.autorun(function() {
    songs = SongFiles.find({}, {
      sort: {createdAt: -1},
      limit: Session.get('page') * 10,
    });
  });
    
}

Template.profile.events({
  'click #submit-feedback': function() {
    var $input = $('#feedback-input');
    
    Meteor.call('submitFeedback', $input.val(), function(err) {
      if (err) {
        alert(err.reason);
      } else {
        $input.val('');  
      }
    });
  },

  'click .my-item': function(evt) {
    var _id = evt.currentTarget.dataset.gameId;
    Router.go('songFile', {_id: _id});
  },

  'click #load-more-games': function(evt) {
    Session.set('page', Session.get('page') + 1);
  },
});



Template.profile.noMoreSongs = function() {
  return SongFiles.find().count() <= Session.get('page') * 10;
};

Template.profile.mySongs = function() {
  return songs;
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