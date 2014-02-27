var context;
var song;
var songId;
// var isPreview;

Template.editSong.created = function() {
  song = this.data.song;

  Session.set('mainTrack', song.mainTrack);
  // LeadPlayer.create(song);
  // isPreview = true;
}

Template.editSong.rendered = function() {  
  // if (isPreview) {
  //   var self = this;
  //   Deps.autorun(function() {
  //     if (song.notes) {        
  //       LeadPlayer.setPlayNotes(song.notes);
  //       isPreview = false;
  //     }
  //   });
  // }

  LeadPlayer.redisplayNotes();
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
    emptytext: 'Youtube Link',
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
    var mainTrack = Session.get('mainTrack');
    var shift = Session.get('shift');
    var speed = Session.get('playSpeed');
    
    Meteor.call('gamify', songId, mainTrack, shift, speed, function(err) {
      if (err) {
        alert(err.reason);
      } else {
        Router.go('game', {_id: songId})
      }
    });
  },

  'click .delete-btn': function(evt) {
    var res = confirm('Are you sure?');

    if (!res) return;
    
    var songId = evt.currentTarget.dataset.songId;

    Router.go('profile'); // buggy if we postpone this
    
    Meteor.call('removeSong', songId, function(err) {
      if (err) {
        alert(err.reason);
      }
    })
  },

  'click .remove-track': function(evt) {
    var dom = evt.currentTarget;
    var segmentId = parseInt(dom.dataset.segmentId);

    Meteor.call('removeTrack', song._id, segmentId, function(err, notes) {
      if (err) {
        alert(err.reason);
      }else {
        LeadPlayer.reset(0);
        LeadPlayer.setPlayNotes(notes);
        LeadPlayer.updateProximateNotes();
      }
    });
  },

  'click .unremove-track': function(evt) {
    var dom = evt.currentTarget;
    var segmentId = parseInt(dom.dataset.segmentId);

    Meteor.call('unremoveTrack', song._id, segmentId, function(err, notes) {
      if (err) {
        alert(err.reason);
      }else {
        LeadPlayer.reset(0);
        LeadPlayer.setPlayNotes(notes);
        LeadPlayer.updateProximateNotes();
      }
    });
  },

});


Template.editSong.segmentInfos = function() {
  var ret = [];
  var song = this.song; // this.song is reactive

  for (var i = song.segmentIds.length - 1; i >= 0; i--) {
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

Template.editSong.isMyPart = function(segmentId) {
  simpleRecorder.notes
}

function drawNotes() {
  var idx = Session.get('playIndex') - LeadPlayer.proximateNotes.length - LeadPlayer.computerProximateNotes.length;
  if (!idx) idx = 0;

  var notes = LeadPlayer.playNotes;
  if (notes.length === 0) return ; // no track selected

  var offset = notes[idx].time;

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = idx; i < notes.length; i++) {
    var note = notes[i];
    var y = (note.time - offset) / 20 + 10;
    if (y > canvas.height) break;

    if (note.isKeyboardDown) {
      context.fillStyle = 'rgb(0, 0, 0)'; // black
      context.fillText(
        noteToName(note.note, true) + note.segmentId, 
        (note.note - 25) * 10, // x-position. 25 is possibly the lowest note
        y + 20 // y-position
      );
    }
  }
}
