// halted when the
LyricsInsertMode = {
  init: function() {
    // this.noteShallPass = false; // allow the user to hear the note without progressing further
    this.currentNote;

    var self = this;
    
    $(window).on('noteInserted.insertMode', function(evt, data) {
      MidiReplayer.start();
    });

    MidiReplayer.start();
  },

  handleData: function(data) {
    if (data.action === 'play') {
      if (data.note.subtype === 'noteOn' 
          && data.note.trackId === Session.get('currentTrackId')) {

        // Play the note but pause at the next note
        MidiReplayer.pause();
        MidiReplayer.playNote(data.note); 
        this.currentNote = data.note; // used in lyricsEditor

        // must update manually. Otherwise, we will keep playing and pausing at the same note
        // other modes may not require update because there is no pause
        Session.set('replayerIndex', data.replayerIndex + 1); 
      } else {
        // this.noteShallPass = false;
        // data.note.velocity /= 3; // todo: adjust this else where
        MidiReplayer.playNote(data.note);
      }
    } else if (data.action === 'stop') {
      MidiReplayer.stop();
    }
  },
}