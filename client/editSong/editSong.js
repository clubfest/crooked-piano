var canvas;
var context;
var song;
var songId;

Template.editSong.created = function() {
}

Template.editSong.rendered = function() {  
  // if (!this.rendered) {    
  //   this.rendered = true;
    var self = this;

    Deps.autorun(function() {
      song = self.data.song;
    });
  // }
  canvas = document.getElementById('notes-canvas');

  canvas.height = 500; // canvas must be less than 8192
  canvas.width = 800;

  context = canvas.getContext('2d');
  context.font = 'italic 16px Calibri';

  Deps.autorun(function() {
    drawNotes();
  });
  

  songId = song._id;
  
  $('#main-track-editable').editable({
    mode: "inline",
    onblur: 'submit',
    success: function(res, newValue) {
      Meteor.call('updateSongMainTrack', songId, newValue, function(err) {
        if (err) alert(err.reason);
      });
    },
  });

  $('#shift-editable').editable({
    mode: "inline",
    onblur: 'submit',
    success: function(res, newValue) {
      Meteor.call('updateSongShift', songId, newValue, function(err) {
        if (err) alert(err.reason);
      });
    },
  });

  $('#youtube-link-editable').editable({
    mode: "inline",
    onblur: 'submit',
    success: function(res, newValue) {
      Meteor.call('updateSongYoutubeLink', songId, newValue, function(err) {
        if (err) alert(err.reason);
      });
    },
  });
}

Template.editSong.events({
  'click #gamify-song': function(evt, tmpl) {
    var songId = this.replayerSong._id;
    var mainTrack = $('#main-track-input').val();
    mainTrack = parseInt(mainTrack);
    
    Meteor.call('gamify', songId, mainTrack, function(err) {
      if (err) {
        alert(err.reason);
      } else {
        Router.go('game', {_id: songId, segmentLevel: 0})
      }
    });
  },

  'click .delete-btn': function(evt) {
    var res = confirm('Are you sure?');

    if (!res) return;
    
    var songId = evt.currentTarget.dataset.songId;

    Meteor.call('removeSong', songId, function(err) {
      if (err) alert(err.reason);
    })
  },

  'click .remove-track': function(evt) {
    var dom = evt.currentTarget;
    var segmentId = parseInt(dom.dataset.segmentId);

    simpleReplayer.stop();

    Meteor.call('removeTrack', song._id, segmentId, function(err) {
      if (err) {
        alert(err.reason);
      }else {
        simpleReplayer.play();
      }
    });
  },

  'click .unremove-track': function(evt) {
    var dom = evt.currentTarget;
    var segmentId = parseInt(dom.dataset.segmentId);

    simpleReplayer.stop();


    Meteor.call('unremoveTrack', song._id, segmentId, function(err) {
      if (err) {
        alert(err.reason);
      }else {
        simpleReplayer.play();
      }
    });
  },

});


Template.editSong.segmentInfos = function() {
  var ret = [];
  var song = this.song; // this.song is reactive

  for (var i = 0; i < song.segmentIds.length; i++) {
    var segmentId = song.segmentIds[i];
    var segment = song.segments[segmentId];

    // add some additional info
    segment.segmentId = segmentId;
    
    ret.push(segment);
  }

  return ret;
}

Template.editSong.isRemoved = function() {
  var segment = this;
  return segment.isRemoved;
}

function drawNotes() {
  var idx = Session.get('replayerIndex');
  if (!idx) idx = 0;

  if (song.notes.length === 0) return ; // no track selected

  var offset = song.notes[idx].time;

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = idx + 1; i < song.notes.length; i++) {
    var note = song.notes[i];
    var y = (note.time - offset) / 20 + 10;
    if (y > canvas.height) break;

    if (note.isKeyboardDown) {

      context.fillStyle = 'rgb(0, 0, 0)'; // black
      context.fillText(
        noteToName(note.note, true) + note.segmentId, 
        (note.note - 25) * 15, // x-position. 25 is possibly the lowest note
        y // y-position
      );
    }
  }
}
