var songId;
var $input;
var index;

Template.lyricsEditor.rendered = function() {
  Session.set('lyricsEditorText', null);
  MidiReplayer.loadPlayMode(LyricsInsertMode);
  $input = $('#lyrics-input');
  songId = this.data.song._id;



  Meteor.call('findOrCreateUserTrack', songId, 'lyrics', 'New Lyrics', function(err, result){
    if (err) {
      alert(err.reason);
    } else {
      Deps.autorun(function() {
        Session.set('userTrack', UserTracks.findOne(result));
      });
      // updateIndex();
    }
  });

  var self = this;

  $(window).on('noteProcessed.lyricsEditor', function(evt, data) {
    if (data.trackId === Session.get('currentTrackId')) {
      var currentTime = Session.get('timeInTicks');
      var notes = Session.get('userTrack').notes;

      for (var i = 0; i < notes.length; i++) {
        if (notes[i].startTimeInTicks === data.startTimeInTicks) {
          Session.set('lyricsEditorText', notes[i].text);
          $input.val(notes[i].text);
          index = i;
          break ;
        }
      }
    }
  });
  // $(window).on('replayerSliderMoved.lyricsEditor', function() {
  //   updateIndex();
  // });
}

Template.lyricsEditor.destroyed = function() {
  MidiReplayer.loadPlayMode(ReplayMode);
  $(window).off('noteProcessed.lyricsEditor');
  // $(window).off('replayerSliderMoved.lyricsEditor');
}

Template.lyricsEditor.events({
  'keydown #lyrics-input': function(evt) {
    if (evt.keyCode === 13) {
      var text = $input.val();
      var note = LyricsInsertMode.currentNote; // note before lyrics
      // var index = Session.get('lyricsEditorIndex');

      Meteor.call('addTextToUserTrack', 'lyrics', text, note, Session.get('userTrack'), function(err, result){
        if (err) {
          alert(err.reason);
        } else {
          $input.val('');
        }
      });

      $(window).trigger('noteInserted'); // needed to get replayer going in LyricsInsertMode
      // Session.set('lyricsEditorIndex', index + 1);

    }

    if (evt.keyCode === 8 && $input.val().length === 0) {
      MidiReplayer.goBack(2);  // move 2 steps because we are ahead 1 step and we want to move back 1 step
    }
  },
  // 'keydown textarea': function(evt) {
  //   if (evt.keyCode === 13) {
  //     var $input = $('textarea');
  //     var text = $input.val();
  //     console.log(text);
  //     var note = LyricsInsertMode.currentNote; // note before lyrics
  //     // var index = Session.get('lyricsEditorIndex');

  //     Meteor.call('addTextToUserTrack', 'lyrics', text, note, Session.get('userTrack'), function(err, result){
  //       if (err) {
  //         alert(err.reason);
  //       } else {
  //         $input.val('');
  //       }
  //     });

  //     $(window).trigger('noteInserted'); // needed to get replayer going in LyricsInsertMode
  //     // Session.set('lyricsEditorIndex', index + 1);

  //   }
  // },
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
  // var userTrack = Session.get('userTrack');
  // // var index = Session.get('lyricsEditorIndex');
  // if (userTrack && index < userTrack.notes.length) {
  //   return userTrack.notes[index].text;
  // }
  return Session.get('lyricsEditorText');
}

// function updateIndex() {
//   var currentTime = Session.get('timeInMicroseconds');
//   var userTrack = Session.get('userTrack');

//   for (var i = 0; i < userTrack.notes.length; i++) {
//     var note = userTrack.notes[i];

//     if (note.startTimeInMicroseconds >= currentTime) {
//       break ;
//     }
//   }  

//   Session.set('lyricsEditorIndex', i);
// }
