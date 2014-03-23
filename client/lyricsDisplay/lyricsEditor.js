
Template.lyricsEditor.rendered = function() {
  MidiReplayer.loadEditMode 
}

Template.lyricsEditor.destroyed = function() {
  MidiReplayer.loadReplayMode
}

Template.lyricsEditor.events({
  'click #left-shift': function() {

  },
  'click #right-shift': function() {

  },
  'keydown #lyrics-input': function(evt) {
    if (evt.keyCode === 13) {
      var text = $('#lyrics-input').val();
      if (text.length > 0) {
        Meteor.call('insertLyrics', text, function(err) {
          if (err) alert(err.reason);
        });
      }
    }
    MidiReplayer.continuePlaying
  },
});