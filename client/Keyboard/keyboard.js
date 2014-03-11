Template.keyboard.created = function() {
  Session.setDefault('isAlphabetNotation', false);
}

Template.keyboard.rendered = function() {
  if (IS_IOS) {
    simpleKeyboard.connectTouchToKeyboard(); 
  } else {
    simpleKeyboard.connectMouseToKeyboard();
  }
}

Template.keyboard.events({
  'click #load-sound': function() {
    loadMidiJs();
  }
});

Template.keyboard.loadProgress = function() {
  var loadProgress = Session.get('loadProgress') || 0;
  return Math.floor(loadProgress * 100 / (NUM_FILES + 1));
}