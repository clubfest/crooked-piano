// TODO: think about whether to store each segment individually
// TODO: think about adding id to each note
var fileName;

Template.upload.rendered = function() {
  SheetDrawer.init();
  // SheetDrawer.setNotes(Uploader.midi.tracks[1]);
  SheetDrawer.drawWestern();
  
  var midiInput = document.getElementById('midi-input');

  midiInput.onchange = function(evt) {
    var fileList = midiInput.files;
    if (fileList.length > 0) {
      var file = fileList[0];
      fileName = file.name.split(/(\\|\/)/g).pop();
      fileReader.readAsBinaryString(file);
      // fileReader.readAsText(file, 'Big5');
    }
  }

  // Drag and drop
  var obj = $("#dragandrophandler");
  obj.on('dragenter', function (e) 
  {
      e.stopPropagation();
      e.preventDefault();
      $(this).css('border', '2px solid #0B85A1');
  });
  obj.on('dragover', function (e) 
  {
       e.stopPropagation();
       e.preventDefault();
  });
  obj.on('drop', function (e) 
  {
   
      $(this).css('border', '2px dotted #0B85A1');
      e.preventDefault();
      var fileList = e.originalEvent.dataTransfer.files;
   
      if (fileList.length > 0) {
        var file = fileList[0];
        fileReader.readAsDataURL(file);
      }
  });

  $(document).on('dragenter', function (e) 
  {
      e.stopPropagation();
      e.preventDefault();
  });
  $(document).on('dragover', function (e) 
  {
    e.stopPropagation();
    e.preventDefault();
    obj.css('border', '2px dotted #0B85A1');
  });
  $(document).on('drop', function (e) 
  {
      e.stopPropagation();
      e.preventDefault();
  });
}

var fileReader = new FileReader;

fileReader.onload = function() {
  var midiFile = MidiFile(fileReader.result);
  Uploader.load(midiFile, fileName);

  

  
  // var player = MIDI.Player;

  // try {
  //   player.loadFile(fileReader.result);
  // } catch (e) {
  //   Session.set('message', 'Upload failed');
  //   return ;
  // }


  // Translator.midiToNotes(player.data);
  
  // Translator.createTranslatedSong(function(songId) {
  //   Router.go('editSong', {_id: songId});
  // });
}
