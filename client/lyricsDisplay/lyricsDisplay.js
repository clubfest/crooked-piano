
Template.lyricsDisplay.rendered = function() {
  LyricsDisplay.init(this.data.song);
}

Template.lyricsDisplay.currentLyrics = function() {
  var lyricsString = "";
  var lyricsForDisplay = Session.get('lyricsForDisplay');
  if (!lyricsForDisplay) return; 

  for (var i = 0; i < lyricsForDisplay.length; i++) {
    var text = lyricsForDisplay[i].text;
    if (i === 0) {
      lyricsString += "<span id='first-lyrics'>" + htmlEncode(text) + "</span>";
    } else {
      lyricsString += htmlEncode(text);
    }
  }
  return lyricsString;
}