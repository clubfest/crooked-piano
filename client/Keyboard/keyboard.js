
Template.keyboard.rendered = function() {
  if (IS_IOS) {
    simpleKeyboard.connectTouchToKeyboard(); 
  } else {
    simpleKeyboard.connectMouseToKeyboard();
  }
}