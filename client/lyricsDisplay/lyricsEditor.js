var songId;
var userTrack;
var $input;
var index;

Editor = {
  init: function(trackId, song) {
    this.track = song.userTracks[trackId];
  },
};

Template.lyricsEditor.rendered = function() {
  Session.set('lyricsEditorText', null);
  MidiReplayer.loadPlayMode(LyricsInsertMode);
  $input = $('#lyrics-input');
  songId = this.data.song._id;

  $('#lyrics-title-editable').editable({
    emptytext: 'Lyrics Title',
    mode: "inline",
    onblur: 'submit',
    success: function(res, newValue) {
      // Meteor.call('updateSongArtist', songId, newValue, function(err) {
      //   if (err) alert(err.reason);
      // });
      alert('not implemented')
    },
  });
  
  // Editor.init(18, this.data.song);    
  // var self = this;
  // Meteor.call('findOrCreateUserTrack', songId, 'lyrics', 'New Lyrics', function(err, result){
  //   if (err) {
  //     alert(err.reason);
  //   } else {
  //     Deps.autorun(function() {
  //       Session.set('userTrack', UserTracks.findOne(result));
  //     });
  //     $(window).on('noteProcessed.lyricsEditor', function(evt, data) {
  //       if (data.trackId === Session.get('currentTrackId')) {
  //         var currentTime = Session.get('timeInTicks');
  //         var notes = Session.get('userTrack').notes;

  //         for (var i = 0; i < notes.length; i++) {
  //           if (notes[i].startTimeInTicks === data.startTimeInTicks) {
  //             Session.set('lyricsEditorText', notes[i].text);
  //             $input.val(notes[i].text);
  //             index = i;
  //             break ;
  //           }
  //         }
  //       }
  //     });
  //   }
  // });
}

Template.lyricsEditor.destroyed = function() {
  MidiReplayer.loadPlayMode(ReplayMode);
  $(window).off('noteProcessed.lyricsEditor');
}

Template.lyricsEditor.events({
  'click #lyrics-left': function(evt) {
    MidiReplayer.goBack(2);  // move 2 steps because we are ahead 1 step and we want to move back 1 step
  },

  'click #lyrics-right': function(evt) {
    saveLyricsToUserTrack(); 
  },

  'keydown #lyrics-input': function(evt) {
    if (evt.keyCode === 13) {
      saveLyricsToUserTrack();
    }

    // if (evt.keyCode === 8 && $input.val().length === 0) {
    //   MidiReplayer.goBack(2);  // move 2 steps because we are ahead 1 step and we want to move back 1 step
    // }
  },

  'keydown textarea': function(evt) {
    if (evt.keyCode === 13) {
      var $textarea = $('textarea');
      var text = $textarea.val();
      var note = LyricsInsertMode.currentNote; // note before lyrics
      if (!note) {
        alert('Wait for the player to pause before inserting');
        return ;
      }

      Meteor.call('addTextToUserTrack', 'lyrics', text, note, Session.get('userTrack'), function(err, result){
        if (err) {
          alert(err.reason);
        } else {
          $textarea.val('');
        }
      });

      $(window).trigger('noteInserted'); // needed to get replayer going in LyricsInsertMode
    }

    // if (evt.keyCode === 8 && $input.val().length === 0) {
    //   MidiReplayer.goBack(2);  // move 2 steps because we are ahead 1 step and we want to move back 1 step
    // }
  },
});

Template.lyricsEditor.lyricsEntered = function() {
  var userTrack = Session.get('userTrack');
  if (!userTrack) return ;

  var ret = "";
  for (var i = 0; i < userTrack.notes.length; i++) {
    var note = userTrack.notes[i];
    ret += note.text;
    if (note.text.match('[,.?!][\ ]*$')) {
      ret += "<br/>"
    }
  }
  return ret;
}

Template.lyricsEditor.lyricsEditorText = function() {
  return Session.get('lyricsEditorText');
}

function saveLyricsToUserTrack() {
  var note = LyricsInsertMode.currentNote; // note that aligns with the lyrics

  if (!note || note.startTimeInTicks !== Session.get('timeInTicks')) {
    MidiReplayer.goForward();
    return ;
  }

  var text = $input.val();

  Meteor.call('addTextToUserTrack', 'lyrics', text, note, Session.get('userTrack'), function(err, result){
    if (err) {
      alert(err.reason);
    } else {
      $input.val('');
      $(window).trigger('noteInserted'); // needed to get replayer going in LyricsInsertMode
    }
  });
}