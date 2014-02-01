
Template.keyboard.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    var isIos = navigator.userAgent.match(/(iPhone|iPad|webOs|Android)/i); 

    if (isIos) {
      simpleKeyboard.connectTouchToKeyboard(); 
    } else {
      simpleKeyboard.connectMouseToKeyboard();
    }

  }
}