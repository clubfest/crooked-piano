
Template.songFile.rendered = function() {
  var songId = this.data.song._id;


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

  $('#youtube-link-editable').editable({
    mode: "inline",
    emptytext: 'Youtube Link',
    onblur: 'submit',
    success: function(res, newValue) {
      Meteor.call('updateSongYoutubeLink', songId, newValue, function(err) {
        if (err) alert(err.reason);
      });
    },
  }); 
}