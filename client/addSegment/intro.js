
Template.intro.song = function() {
  return this.song;
}

Template.intro.rendered = function() {
  var songId = this.data.song._id;

  $('#desc-editable').editable({
    emptytext: 'Description',
    mode: "inline",
    onblur: 'submit',
    success: function(res, newValue) {
      Meteor.call('updateSongDesc', songId, newValue, function(err) {
        if (err) alert(err.reason);
      });
    },
  });

  $('#title-editable').editable({
    emptytext: 'Title',
    mode: "inline",
    onblur: 'submit',
    success: function(res, newValue) {
      Meteor.call('updateSongTitle', songId, newValue, function(err) {
        if (err) alert(err.reason);
      });
    },
  });

  $('#artist-editable').editable({
    emptytext: 'Artist',
    mode: "inline",
    onblur: 'submit',
    success: function(res, newValue) {
      Meteor.call('updateSongArtist', songId, newValue, function(err) {
        if (err) alert(err.reason);
      });
    },
  });
    
}