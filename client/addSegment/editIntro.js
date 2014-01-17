
Template.editIntro.rendered = function() {
  var songId = Session.get('song')._id;

  $(function(){
    $('#desc-editable').editable({
      url: '/post',
      emptytext: 'Description',
      mode: "inline",
      success: function(res, newValue) {
        Meteor.call('updateSongDesc', songId, newValue, function(err) {
          if (err) alert(err.reason);
        })
      },
    });

    $('#title-editable').editable({
      url: '/post',
      emptytext: 'Title',
      mode: "inline",
      success: function(res, newValue) {
        Meteor.call('updateSongTitle', songId, newValue, function(err) {
          if (err) alert(err.reason);
        })
      },
    });
  });
}