
// TODO: think about whether to store each segment individually
// TODO: think about adding id to each note
Template.upload.rendered = function() {
  var midiInput = document.getElementById('midi-input');

  midiInput.onchange = function(evt) {
    var fileList = midiInput.files;
    if (fileList.length > 0) {
      var file = fileList[0];
      var fileReader = new FileReader;

      fileReader.onload = function() {
        var player = MIDI.Player;

        try {
          player.loadFile(fileReader.result);
        } catch (e) {
          Session.set('message', 'Upload failed');
          return ;
        }

        Session.set('message', 'Tranlating');

        Translator.midiToNotes(player.data);
        
        Translator.createTranslatedSong(function(songId) {
          Router.go('editSong', {_id: songId});
        });
      }

      fileReader.readAsDataURL(file);
    }
  }
}

