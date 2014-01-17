
Template.recorder.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;
    simpleRecorder.init();

    // this.recorder = new Recorder;
  }
}

Template.recorder.destroyed = function() {
  simpleRecorder.destroy();
}

Template.recorder.events({
  'click #recorder-stop': function(evt, tmpl) {
    simpleRecorder.stop();
  },

  'click #recorder-start': function(evt, tmpl) {
    simpleRecorder.start();
  },

  'click #recorder-save': function(evt, tmpl) {
    simpleRecorder.save();
  },

  'click #recorder-clear': function(evt, tmpl) {
    simpleRecorder.clear();
  },
});

Template.recorder.isRecording = function() {
  return Session.get('isRecording');
}

Template.recorder.hasRecordedNotes = function() {
  return Session.get('hasRecordedNotes');
}