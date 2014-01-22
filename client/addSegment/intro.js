
Template.intro.rendered = function() {
  Deps.autorun(function() {
    var song = Session.get('replayerSong');

    // TODO: separate the use of intro in different instances
    // if (!song) {
    //   song = Session.get('song');

    //   if (!song) {
    //     return ;
    //   }
    // } 



    var songId = song._id;
    
    $(function(){
      $('#desc-editable').editable({
        url: '/post',
        emptytext: 'Description',
        mode: "inline",
        success: function(res, newValue) {
          Meteor.call('updateSongDesc', songId, newValue, function(err) {
            if (err) alert(err.reason);
          });
        },
      });

      $('#title-editable').editable({
        url: '/post',
        emptytext: 'Title',
        mode: "inline",
        success: function(res, newValue) {
          Meteor.call('updateSongTitle', songId, newValue, function(err) {
            if (err) alert(err.reason);
          });
        },
      });
    });
  });
    
}