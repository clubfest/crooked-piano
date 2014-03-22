
Template.midiWriter.events({
  'click #midi-download': function(evt, tmpl) {
    var song = MidiWriter.fromJasmid(tmpl.data.song.midi)

    var name = $('#file-name').val();
    downloadURI("data:audio/midi;base64," + song.b64, ('ss') +'.mid');
  },
});

downloadURI = function(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  link.click();
}

