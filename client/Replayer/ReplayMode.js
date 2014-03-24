
ReplayMode = {
  handleData: function(data) {
    if (data.action === 'play') {
      MidiReplayer.playNote(data.note);
    } else if (data.action === 'stop') {
      MidiReplayer.stop();
    }
  },
}