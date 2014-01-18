
Template.segmentRecorder.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    simpleRecorder.init();
    simpleRecorder.start();
  }
}

Template.segmentRecorder.destroyed = function() {
  simpleRecorder.destroy();
}


Template.segmentRecorder.events({
  'click .recorder-restart': function() {
    simpleRecorder.stop();
    simpleRecorder.clear();
    simpleRecorder.start();
  },

  'click .recorder-save': function() {
    simpleRecorder.stop();
    simpleRecorder.saveSegment();
  },

  
});


Template.segmentRecorder.hasRecordedNotes = function() {
  return Session.get('hasRecordedNotes');
}



