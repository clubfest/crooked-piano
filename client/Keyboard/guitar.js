
Template.guitar.rendered = function() {
  if (IS_IOS) {
    Guitar.connectTouchToKeyboard(); 
  } else {
    Guitar.connectMouseToKeyboard();
  }

}