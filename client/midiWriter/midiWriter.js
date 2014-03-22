
Template.midiWriter.events({
  'click #midi-download': function() {
    var tracks = [];
    tracks.push(MidiTrack.createNonMidiTrack());
    var noteEvents = [];

    noteEvents.push(MetaEvent.createText('Piano', 'instrumentName'));

    noteEvents.push(MidiEvent.createProgramChange(1));

    ["E4"].forEach(function(note) {
        Array.prototype.push.apply(noteEvents, MidiEvent.createNote(note));
    });
    // noteEvents.push(MetaEvent.createText('hi'));
    
    tracks.push(new MidiTrack({ events: noteEvents }));

    // var noteEvents = [];
    // noteEvents.push(MidiEvent.createProgramChange());
    // ["C4", "E4", "G4"].forEach(function(note) {
    //     Array.prototype.push.apply(noteEvents, MidiEvent.createNote(note));
    // });

    // tracks.push(new MidiTrack({ events: noteEvents }));
    var song  = MidiWriter({ tracks: tracks });

    var name = $('#file-name').val();
    downloadURI("data:audio/midi;base64," + song.b64, (name || 'song') +'.mid');
  },
});

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  link.click();
}

