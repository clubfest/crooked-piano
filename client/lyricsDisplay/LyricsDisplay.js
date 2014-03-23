/*
  To lyrics display, you need to call 
    * LyricsDisplay.updateLyricsForDisplay
    * LyricsDislplay.getLyricsForDisplay
  You can use LyricsDisplay.lyricsTrackId to see when to update
*/
var TIME_RANGE = 5000000;
var MAX_GAP = 2000000;
var START_TIME_FILTER = 100000; // todo: use other info to filter
var CUSHION = 1000000;

LyricsDisplay = {
  init: function(song) {
    this.startIndex = 0;
    Session.set('lyricsForDisplay', []);

    this.initLyricsTrack(song.midi.tracks);
    this.updateLyricsForDisplay();

    var self = this;
    // $(window).on('replayerSliderMoved.lyricsDisplay', function() {
    //   self.startIndex = 0;
    // });

    $(window).on('keyboardDown.lyricsDisplay', function(evt, data) {
      if (data.trackId === self.lyricsTrackId) {
        console.log('update');
        self.updateLyricsForDisplay();
      }
    });
  },

  destroy: function() {

  },

  initLyricsTrack: function(tracks) {
    var lyricsTracks = []; // possible lyrics tracks
    var MIN_WORDS = 20; // e.g. happy birthday

    for (var k = 0; k < tracks.length; k++) {
      var track = tracks[k];
      var lyrics = [];
      var lyricsLength = 0;

      for (var i = 0; i < track.length; i++) {
        var note = track[i];

        if (note.type === 'meta') {
          if (note.subtype === 'lyrics' || note.subtype === 'text') {
            // skip beginning words; TODO: find a better way
            if (note.startTimeInMicroseconds > START_TIME_FILTER) {
              lyrics.push(note);
              if (note.subtype === 'lyrics') {
                lyricsLength++;
              }
            }
          }
        }
      }

      if (lyrics.length > MIN_WORDS) {
        lyricsTracks.push({
          trackId: k,
          lyrics: lyrics,
          lyricsLength: lyricsLength,
        });
      }
    }

    lyricsTracks.sort(function(a, b) {
      // weigh text with subtype lyrics
      return -(a.lyrics.length + a.lyricsLength - b.lyrics.length - b.lyricsLength);
    });

    if (lyricsTracks.length > 0) {
      this.lyricsTrackId = lyricsTracks[0].trackId;
      this.lyrics = lyricsTracks[0].lyrics;
    }
  },

  getLyricsForDisplay: function() {
    return Session.get('lyricsForDisplay');
  },

  updateLyricsForDisplay: function() {
    var lyricsForDisplay = [];
    var time = Session.get('timeInMicroseconds');

    // see if you need to go lower
    for (var i = this.startIndex; i >= 0; i--) {
      var note = this.lyrics[i];
      if (note.startTimeInMicroseconds < time) {
        this.startIndex = i;
        break;
      }
    }

    var firstNotePassed = false;
    for (var i = this.startIndex; i < this.lyrics.length; i++) {
      var note = this.lyrics[i];

      if (note.startTimeInMicroseconds > time) {
        if (!firstNotePassed) {
          if (this.startIndex === i) {
            return ;
          }
          
          if (i > 0) {
            var prevNote = this.lyrics[i-1];
            lyricsForDisplay.push(prevNote);
          }

          this.startIndex = i;
          firstNotePassed = true;
        }

        if (note.startTimeInMicroseconds > time + TIME_RANGE) {
          break ;
        } else if (i > this.startIndex) {
          var prevNote = this.lyrics[i - 1];
          if (note.startTimeInMicroseconds - prevNote.startTimeInMicroseconds > MAX_GAP) {
            break ;
          }
        } 
        lyricsForDisplay.push(note);
      }
    }
    Session.set('lyricsForDisplay', lyricsForDisplay);
  },
}