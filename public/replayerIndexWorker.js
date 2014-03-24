var timeoutId;

onmessage = function(evt){
  var action = evt.data.action;
  if (action === 'start') {
    postAndSetTimeoutToPost(evt.data.notes, evt.data.replayerIndex);  

  } else if (action === 'stop') {
    clearTimeout(timeoutId);
  }
};

function postAndSetTimeoutToPost(notes, replayerIndex) {
  postMessage({action: 'play', replayerIndex: replayerIndex});
  if (replayerIndex + 1 < notes.length) {
    var nextStartTime = notes[replayerIndex + 1].startTimeInMicroseconds;
    var prevStartTime = notes[replayerIndex].startTimeInMicroseconds;
    var delayInMilliseconds = (nextStartTime - prevStartTime) / 1000; 

    timeoutId = setTimeout(function() {
      postAndSetTimeoutToPost(notes, replayerIndex + 1);
    }, delayInMilliseconds);

  } else {
    postMessage({action: 'stop'});
  }
}
