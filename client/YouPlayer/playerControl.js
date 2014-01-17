
Template.playerControl.numCorrect = function() {
  return Session.get('numCorrect');
};

Template.playerControl.numWrong = function() {
  return Session.get('numWrong');
};

Template.playerControl.isDemoing = function() {
  return Session.get('isDemoing');
};
