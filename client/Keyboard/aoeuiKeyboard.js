Template.aoeuiKeyboard.created = function() {
  Session.setDefault('isAlphabetNotation', false);
}

Template.aoeuiKeyboard.rendered = function() {
  if (IS_IOS) {
    simpleKeyboard.connectTouchToKeyboard(); 
  } else {
    simpleKeyboard.connectMouseToKeyboard();
  }
}

Template.aoeuiKeyboard.events({
  'click #load-sound': function() {
    loadMidiJs();
  }
});

Template.aoeuiKeyboard.loadProgress = function() {
  var loadProgress = Session.get('loadProgress') || 0;
  return Math.floor(loadProgress * 100 / (NUM_FILES + 1));
}