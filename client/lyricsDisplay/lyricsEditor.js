var userTrack;
var songId;
var index;

Template.lyricsEditor.rendered = function() {
  MidiReplayer.loadPlayMode(LyricsInsertMode);
  songId = this.data.song._id;

  Meteor.call('findOrCreateUserTrack', songId, 'lyrics', 'New Lyrics', function(err, result){
    if (err) {
      alert(err.reason);
    } else {
      Deps.autorun(function() {
        userTrack = UserTracks.findOne(result);
        Session.set('userTrack', userTrack);
      });
      updateIndex();
    }
  });

  $(window).on('replayerSliderMoved.lyricsEditor', function() {
    updateIndex();
  });
}

Template.lyricsEditor.destroyed = function() {
  MidiReplayer.loadPlayMode(ReplayMode);
  $(window).off('replayerSliderMoved.lyricsEditor');
  forkId = null;
}

Template.lyricsEditor.events({
  'keydown #lyrics-input': function(evt) {
    if (evt.keyCode === 13) {
      var $input = $('#lyrics-input');
      var text = $input.val();
      var note = LyricsInsertMode.currentNote; // note before lyrics

      Meteor.call('addTextToUserTrack', 'lyrics', text, note, index, userTrack, function(err){
        if (err) alert(err.reason);
      });
      $(window).trigger('noteInserted'); // needed to get replayer going in LyricsInsertMode
      index++;

      $input.val('');
    }
  },
});

Template.lyricsEditor.lyricsEntered = function() {
  var userTrack = Session.get('userTrack');
  if (!userTrack) return ;

  var ret = "";
  for (var i = 0; i < userTrack.notes.length; i++) {
    var note = userTrack.notes[i];
    ret += note.text;
    if (note.text.match(/,?/).length > 0) {
      ret += "<br/>"
    }
  }
  return ret;
}

function updateIndex() {
  var currentTime = Session.get('timeInMicroseconds');
  for (var i = 0; i < userTrack.notes.length; i++) {
    var note = userTrack.notes[i];
    if (note.startTimeInMicroseconds > currentTime) {
      break ;
    }
  }  
  index = i;
}
