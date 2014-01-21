Template.addSegment.created = function() {

    
}

Template.addSegment.events({
  'click #gamify-song': function(evt, tmpl) {
    var songId = tmpl.data._id;
    var genre = $('#genre-input').val();
    
    Meteor.call('gamify', songId, genre, function(err) {
      if (err) {
        alert(err.reason);
      } else {
        Router.go('game', {_id: songId })
      }
    });
  }
})

