NO_WORKER = false;
if (typeof Worker === 'undefined') {
  console.log('no web worker')
  NO_WORKER = true;
  Worker = function() {};

  Worker.prototype = {
    // post message to worker
    postMessage: function(data) {
      result = this.onmessageToWorker({data: data});
    },
    postMessageFromWorker: function(data) {
      this.onmessage({data: data});
    },
  }   
} 


  // // This is a imperfect shim for web worker. Example
  // var worker = new Worker();

  // worker.onmessageToWorker = function(evt) {
  //   console.log('worker got message: ' + evt.data);
  //   worker.postMessageFromWorker('hiya');
  // };
  // worker.onmessage = function(evt) {
  //   console.log('main thread got message: ' + evt.data);
  // }

  // worker.postMessage('hi'); 
