
Template.alphabetSheetDrawer.rendered = function() {
  AlphabetSheetDrawer.init(this.data.song);
  Deps.autorun(function() {
    if (Session.get('replayerIndex') !== null)
      AlphabetSheetDrawer.draw();
  });
}