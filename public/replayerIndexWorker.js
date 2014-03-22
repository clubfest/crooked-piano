var timeoutId = null;
var replayerIndex;
var notes;

onmessage = function(evt){
  var action = evt.data.action;
  if (action === 'start') {
    replayerIndex = evt.data.replayerIndex;
    notes = evt.data.notes;
    postReplayerIndexAndIncrementAndPost();  

  } else if (action === 'stop') {
    clearTimeout(timeoutId);
  }
};

function postReplayerIndexAndIncrementAndPost() {
  postMessage({action: 'play', replayerIndex: replayerIndex});

  replayerIndex++; // this will be updated in Session when we play the note

  if (replayerIndex < notes.length) {
    var nextStartTime = notes[replayerIndex].startTimeInMicroseconds;
    var prevStartTime = notes[replayerIndex - 1].startTimeInMicroseconds;
    var delayInMilliseconds = (nextStartTime - prevStartTime) / 1000; 

    timeoutId = setTimeout(postReplayerIndexAndIncrementAndPost, delayInMilliseconds);
  } else {
    postMessage({action: 'stop'});
  }
}
