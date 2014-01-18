
Template.recorder.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;
    
    simpleRecorder.init();
    simpleRecorder.start();
  }
}

Template.recorder.destroyed = function() {
  simpleRecorder.destroy();
}

Template.recorder.events({
  'click .recorder-restart': function() {
    simpleRecorder.stop();
    simpleRecorder.clear();
    simpleRecorder.start();
  },

  'click .recorder-save': function() {
    simpleRecorder.stop();
    simpleRecorder.save();
  },
});

Template.recorder.hasRecordedNotes = function() {
  return Session.get('hasRecordedNotes');
}


