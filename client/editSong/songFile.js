
var songId;

Template.songFile.rendered = function() {
  songId = this.data.song._id;

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
}

Template.songFile.events({
  'click #gamify-btn': function(evt, tmpl) {
    if (!tmpl.data.song.youtubeId || !tmpl.data.song.title) {
      alert('Please provide a youtube link and title before gamifying');
      return;
    }
    Meteor.call('gamify', songId, function(err) {
      if (err) {
        alert(err.reason)
      } else {
        Router.go('game', {_id: songId});
      }
    });
  },
})