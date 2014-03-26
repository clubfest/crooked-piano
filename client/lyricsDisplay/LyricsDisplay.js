/*
*/
var TIME_RANGE = 4000000;
var MAX_GAP = 2000000;
var START_TIME_FILTER = 100000; // todo: use other info to filter
var CUSHION = 1000000;

LyricsDisplay = {
  init: function(song) {
    this.startIndex = 0;
    Session.set('lyricsForDisplay', []);

    this.initLyricsTrack(song);

    var self = this;
    
    if (this.lyrics) {
      this.updateLyricsForDisplay();

      // TODO: not too clean because noteProcessed means before it's played
      $(window).on('noteProcessed.lyricsDisplay', function(evt, data) {
        if (data.trackId === self.lyricsTrackId) {
          self.updateLyricsForDisplay();
        }
      });
    }
  },

  destroy: function() {
    $(window).off('noteProcessed.lyricsDisplay');
  },

  initLyricsTrack: function() {
    var tracks = song.midi.tracks;
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
              if ($.trim(note.text).length > 0) {
                lyrics.push(note);
              }
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
      
    } else { // Load Do Re Mi from the melodicTrack instead
      this.lyrics = [];
      this.lyricsTrackId = song.melodicTrackId;

      var track = tracks[song.melodicTrackId];
      for (var i = 0; i < track.length; i++) {
        var note = track[i];
        var prevNote;

        if (note.subtype === 'noteOn') {
          var altered = $.extend({}, note);
          var text = noteToName(note.noteNumber, false).toLowerCase();
          if (prevNote) {
            if (note.startTimeInBeats - prevNote.startTimeInBeats > 3) {
              prevNote.text += '. ';
              text = text.charAt(0).toUpperCase() + text.slice(1);
            } else if (note.startTimeInBeats - prevNote.startTimeInBeats > 1.5) {
              prevNote.text += ', ';
            } else {
              prevNote.text += ' ';
            }
          } else {
            text = text.charAt(0).toUpperCase() + text.slice(1);
          }
          altered.text = text;
          this.lyrics.push(altered);
          prevNote = altered;
        }
      }
    }
  },

  getLyricsForDisplay: function() {
    return Session.get('lyricsForDisplay');
  },

  updateLyricsForDisplay: function() {
    var lyricsForDisplay = [];
    var time = Session.get('timeInMicroseconds');

    // see if you need to go lower
    for (var i = this.startIndex; i > 0; i--) {
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