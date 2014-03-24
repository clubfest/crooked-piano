// halted when the
LyricsInsertMode = {
  init: function() {
    this.noteShallPass = false;
    this.currentNote;

    var self = this;
    $(window).on('noteInserted.insertMode', function(evt, data) {
      MidiReplayer.start();
      // for (var i = 0; i < self.notesQueue.length; i++) {
      //   MidiReplayer.playNote(self.notesQueue[i]);
      // }
    });
  },

  handleData: function(data) {
    if (data.action === 'play') {
      if (data.note.subtype === 'noteOn' && !this.noteShallPass
          && data.note.trackId === Session.get('currentTrackId')) {
        this.noteShallPass = true;
        MidiReplayer.pause();
        MidiReplayer.playNote(data.note);
        this.currentNote = data.note; // used in lyricsEditor
        Session.set('replayerIndex', data.replayerIndex + 1); // move on
      } else {
        this.noteShallPass = false;
        data.note.velocity /= 3; // todo: adjust this else where
        MidiReplayer.playNote(data.note);
      }
    } else if (data.action === 'stop') {
      MidiReplayer.stop();
    }
  },
}