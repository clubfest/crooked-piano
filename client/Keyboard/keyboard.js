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
  'click #loading-sound': function() {
    loadMidiJs();
  }
})