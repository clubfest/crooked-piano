var forkId;

Template.lyricsEditor.rendered = function() {
  MidiReplayer.loadPlayMode(LyricsInsertMode);
}

Template.lyricsEditor.destroyed = function() {
  MidiReplayer.loadPlayMode(ReplayMode);
  forkId = null;
}

Template.lyricsEditor.events({
  'click #left-shift': function() {

  },
  'click #right-shift': function() {

  },
  'keydown #lyrics-input': function(evt, tmpl) {
    if (evt.keyCode === 13) {
      var $input = $('#lyrics-input');
      var text = $input.val();
      if (text.length > 0) {
        var songId = tmpl.data.song._id;
        var note = LyricsInsertMode.currentNote; // note before lyrics
        Meteor.call('forkLyrics', text, note, forkId, songId, function(err, id) {
          if (err) {
            alert(err.reason);
          } else {
            $input.val('');
            console.log('id in client -----')
            console.log(id)
            forkId = id;
          }
        });
      }
      $(window).trigger('noteInserted'); // needed to get replayer going in LyricsInsertMode
    }
  },
});