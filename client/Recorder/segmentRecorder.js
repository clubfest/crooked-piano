
Template.segmentRecorder.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;
    simpleRecorder.init();
  }
}

Template.segmentRecorder.destroyed = function() {
  simpleRecorder.destroy();
}


Template.segmentRecorder.events({
  'click #recorder-stop': function(evt, tmpl) {
    simpleRecorder.stop();
  },

  'click #recorder-start': function(evt, tmpl) {
    simpleRecorder.start();
  },

  'click #recorder-save': function(evt, tmpl) {
    simpleRecorder.saveSegment();
  },

  'click #recorder-clear': function(evt, tmpl) {
    simpleRecorder.clear();
  },
});

Template.segmentRecorder.isRecording = function() {
  return Session.get('isRecording');
}

Template.segmentRecorder.hasRecordedNotes = function() {
  return Session.get('hasRecordedNotes');
}