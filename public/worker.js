onmessage = function(e){
  var noteNumber = 60;
  if ( e.data === "start" ) {
    // Do some computation

    setInterval(function() {
      if (noteNumber > 71) {
        noteNumber--;
      } else {
        noteNumber++;
      }
      postMessage({
        noteNumber: noteNumber,
        velocity: 60,
      })
    }, 1500);
  }
};
 
