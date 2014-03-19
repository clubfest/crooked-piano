var timeoutId = null;

onmessage = function(evt){
  var action = evt.data.action;
  if (action === 'start') {
    var replayerIndex = evt.data.replayerIndex;
    var notes = evt.data.notes;
    var note;

    postReplayerIndexAndIncrementAndPost();  

    function postReplayerIndexAndIncrementAndPost() {
      postMessage({action: 'play', replayerIndex: replayerIndex});

      replayerIndex++;

      if (replayerIndex < notes.length) {
        var nextStartTime = notes[replayerIndex].startTimeInMicroseconds;
        var prevStartTime = notes[replayerIndex - 1].startTimeInMicroseconds;
        var delayInMilliseconds = (nextStartTime - prevStartTime) / 1000; 

        timeoutId = setTimeout(postReplayerIndexAndIncrementAndPost, delayInMilliseconds);
      } else {
        postMessage({action: 'stop'});
      }
    }
  } else if (action === 'stop') {
    clearTimeout(timeoutId);
  }
};
