

Template.addSegment.events({
  'click #gamify-song': function(evt, tmpl) {
    var songId = this.replayerSong._id;
    var mainTrack = $('#main-track-input').val();
    mainTrack = parseInt(mainTrack);
    
    Meteor.call('gamify', songId, mainTrack, function(err) {
      if (err) {
        alert(err.reason);
      } else {
        Router.go('game', {_id: songId, segmentLevel: 0})
      }
    });
  }
})

