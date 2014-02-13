var canvas;
var context;
var song;
var songDep = new Deps.Dependency;

Template.editSong.created = function() {
  song = this.data.song;
}

Template.editSong.rendered = function() {
  

  canvas = document.getElementById('notes-canvas');

    canvas.height = 700; // canvas must be less than 8192
    canvas.width = 800;

    context = canvas.getContext('2d');
    context.font = 'italic 16px Calibri';
    drawNotes();

  if (!this.rendered) {    
    this.rendered = true;

    song = this.data.song;

    Deps.autorun(drawNotes);
  }

}

Template.editSong.events({
  'click .segment-checkbox': function(evt) {
    var dom = evt.currentTarget;
    var segmentId = parseInt(dom.dataset.segmentId);

    if (dom.checked) {
      Meteor.call('unremoveTrack', song._id, segmentId, function(err) {
        if (err) {
          alert(err.reason);
        }else {
        }
      });
    } else {
      Meteor.call('removeTrack', song._id, segmentId, function(err) {
        if (err) {
          alert(err.reason);
        } else {
        }
      });
    }
  },
  'click #redraw': function() {
    drawNotes();
  },
});

Template.editSong.isRemoved = function() {
  return song.segments[this.segmentId].isRemoved;
}

function randomColor(i) {
  return 'rgb(' + Math.floor(37 * i * i % 150) + ', ' + Math.floor(89 * i * i % 150) + ', ' + Math.floor(131 * i * i % 150) + ')';
}

function drawNotes() {
  var idx = Session.get('replayerIndex');
  if (!idx) idx = 0;

  if (song.notes.length === 0) return; // no track selected

  var offset = song.notes[idx].time;

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = idx; i < song.notes.length; i++) {
    var note = song.notes[i];
    var y = (note.time - offset) / 5 + 10;
    if (y > canvas.height) break;

    if (note.isKeyboardDown) {

      context.fillStyle = randomColor(note.segmentId);
      context.fillText(
        noteToName(note.note, true) + note.segmentId, 
        (note.note - 44) * 15, // x-position
        y // y-position
      );
    }
  }

}