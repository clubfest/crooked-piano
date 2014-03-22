/*
  To lyrics display, you need to call 
    * LyricsDisplay.updateLyricsForDisplay
    * LyricsDislplay.getLyricsForDisplay
  You can use LyricsDisplay.lyricsTrackId to see when to update
*/
var MICROSECONDS_FOR_DISPLAY = 5000000;
var START_TIME_FILTER = 100000; // todo: use other info to filter

LyricsDisplay = {
  init: function(song) {
    this.startIndex = 0;
    Session.set('lyricsForDisplay', []);

    this.initLyricsTrack(song.midi.tracks);

    var self = this;
    $(window).on('replayerSliderMoved.lyricsDisplay', function() {
      self.searchForStartIndex();
    });
  },

  initLyricsTrack: function(tracks) {
    var lyricsTracks = []; // possible lyrics tracks
    var MIN_WORDS = 20; // e.g. happy birthday

    for (var k = 0; k < tracks.length; k++) {
      var track = tracks[k];
      var lyrics = [];

      for (var i = 0; i < notes.length; i++) {
        var note = track[i];
        if (note.subtype === 'lyrics' || note.subtype === 'text') {
          // skip beginning words; TODO: find a better way
          if (note.startTimeInMicroseconds > START_TIME_FILTER) {
            lyrics.push(note);
          }
        }
      }

      if (lyrics.length > MIN_WORDS) {
        lyricsTracks.push({
          trackId: k,
          lyrics: lyrics
        });
      }
    }

    lyricsTracks.sort(function(a, b) {
      return -(a.lyrics.length - b.lyrics.length);
    });

    if (lyricsTracks.length > 0) {
      this.lyricsTrackId = lyricsTracks[0].trackId;
      this.lyrics = lyrics;
    }
  },

  getLyricsForDisplay: function() {
    return Session.get('lyricsForDisplay');
  },

  updateLyricsForDisplay: function() {
    var lyricsForDisplay = [];
    var time = Session.get('timeInMicroseconds');

    var startIndex = Math.max(0, this.startIndex - 1);
    var firstNotePassed = false;

    for (var i = startIndex; i < this.lyrics.length; i++) {
      var note = lyrics[i];

      if (note.startTimeInMicroseconds > time) {
        lyricsForDisplay.push(note);

        if (firstNotePassed) {
          this.startIndex++;
          firstNotePassed = true;
        }
      }

      if (note.startTimeInMicroseconds > time + MICROSECONDS_FOR_DISPLAY) {
        break ;
      }
    }
    Session.set('lyricsForDisplay', lyricsForDisplay);
  },

  // only use this when you are lost
  searchForStartIndex: function() {
    var time = Session.get('timeInMicroseconds')

    for (var i = 0; i < this.lyrics.length; i++) {
      var note = lyrics[i];

      if (note.startTimeInMicroseconds > time) {
        this.startIndex = i;
        return;
      }
    }
  },
}