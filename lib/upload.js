if (Meteor.isServer) {
  Meteor.methods({
    downloadMidi: function(url) {
      if (!Meteor.userId()) {
        throw new Meteor.Error(413, 'Please sign in first.');
      }
      var http = Npm.require('http');
      var buffer = new Buffer('', 'base64');
      var chunks = '';

      var response = Async.runSync(function(done) {
        http.get(url).on('response', function(res) {
          res.on('data', function(chunk){
            chunks += chunk;
            buffer = Buffer.concat([buffer, chunk]);
          }).on('end', function() {
            done(null, buffer);
          })
          .on('error', function() {
            throw new Meteor.Error(413, 'There is a problem with the downloading.');
          });
        });
      });

      var bytes = response.result.toString('binary');

      try {
        var replayer = new Replayer(new MidiFile(bytes), 1); // 1 for time-warp

        var rawData = replayer.getData();
        Uploader.load(midiFile, fileName);
      } catch(e) {
        console.log(e)
        throw new Meteor.Error(413, "Unable to convert.");
      }
    },
  });
}

// translate to gamified song by adding extra info: isStart and isEnd
Translator = {
  midiToNotes: function(data) {
    this.rawData = data;
    this.notes = [];
    this.notesByTrack = {};
    this.channels = {};
    this.tracks = {}; // identified by the channel and the segmentId

    this.songInfo = {
      idCounter: 0,
      copyrightNotice: "",
      instruments: [],
      trackNames: [],
      lyrics: [],
      lyricsBackup: [],
    };
    var channelToInstrument = {}

    var time = 0;

    for (var i = 0; i < data.length; i++) {
      var noteInfo = data[i];
      // console.log(noteInfo);

      var event = noteInfo[0].event;
      
      time += noteInfo[1];

      if (event.subtype === "noteOn" || event.subtype === "noteOff") {
        var segmentId = noteInfo[0].track;
        var note = {
          time: time,
          note: event.noteNumber,
          velocity: event.velocity,
          segmentId: segmentId,
          event: event.subtype,
          id: this.songInfo.idCounter,
        }

        this.songInfo.idCounter++;

        this.notes.push(note);

        if (!this.notesByTrack[segmentId]) {
          this.notesByTrack[segmentId] = {
            notes: [],
            channels: {},
          };
        }

        if (!this.channels[event.channel]) {
          this.channels[event.channel] = {
            notes: [],
            programNumber: 0,
            programNumbers: [],
            segmentIds: {},
          }
        }

        this.channels[event.channel].segmentIds[segmentId] = this.songInfo.idCounter;
        this.notesByTrack[segmentId].channels[event.channel] = this.songInfo.idCounter;

        if (!this.notesByTrack[segmentId].channel) {
          this.notesByTrack[segmentId].channel = event.channel;
        } else {
          if (this.notesByTrack[segmentId].channel !== event.channel) {
            // console.log('This track has a note with a different channel')
            // console.log("track: " + segmentId);
            // console.log('old channel: ' + this.notesByTrack[segmentId].channel);
            // console.log('channel: ' + event.channel);
          }
        }
        this.notesByTrack[segmentId].notes.push(note);
        this.channels[event.channel].notes.push(note);

      } else if (event.subtype === 'trackName') {
        if (!this.notesByTrack[noteInfo[0].track]) {
          this.notesByTrack[noteInfo[0].track] = {
            notes: [],
            channel: event.channel, // TODO: what happens if channel changes?
            channels: {},
          }
        }

        // Save the instrument name
        this.notesByTrack[noteInfo[0].track].text = event.text;
        this.songInfo.trackNames.push(event.text);

      } else if (event.subtype === 'timeSignature') {
        // used for local tonality
        // console.log(event)
      } else if (event.subtype === 'keySignature') {
        // used for global tonality
        // console.log(event)
      } else if (event.subtype === 'instrumentName') {
        // does not usually give anything useful
        this.songInfo.instruments.push(event.text);
      } else if (event.subtype === 'lyrics') {
        // if (event.deltaTime) {
        //   time += event.deltaTime;
        // }
        // this.notes.push({
        //   event: 'lyrics',
        //   text: event.text,
        //   time: time,
        //   index: this.songInfo.lyricsBackup.length,
        // });

        this.songInfo.lyricsBackup.push(event.text);

      } else if (event.subtype === 'copyrightNotice') {
        this.songInfo.copyrightNotice = event.text;
      } else if (event.type === 'meta' && event.subtype === 'text') {
        // TODO: remove the chord info
        this.notes.push({
          event: 'lyrics',
          text: event.text,
          time: time,
          index: this.songInfo.lyrics.length,
        });
        
        this.songInfo.lyrics.push(event.text);

      } else if (event.subtype === "programChange") {
        if (!this.channels[event.channel]) {
          this.channels[event.channel] = {
            notes: [],
            programNumber: event.programNumber,
            programNumbers: [event.programNumber],
            segmentIds: {},
          };
        } else {
          this.channels[event.channel].programNumbers.push(event.programNumber);
        }

        if (event.channel === 10 && percussionCodeToName[event.programNumber]) {
          this.channels[event.channel].instrument = percussionCodeToName[event.programNumber];
        } else {
          this.channels[event.channel].instrument = instrumentCodeToName[event.programNumber];
        }

        // console.log('----= time: ' + time);
        // console.log('program change');
        // console.log(event);
        if (channelToInstrument[event.channel]) {
          // console.log('The channel changed instrument'); // TODO: handle this
          // console.log('channel: ' + event.channel);
          // console.log('old instrument: ' + channelToInstrument[event.channel]);
          // console.log('new instrument: ' + event.programNumber);
        }
        // if (event.programNumber > 0) {
          channelToInstrument[event.channel] = event.programNumber;
        // }
      } else {
        if (event.subtype === 'setTempo'){
        console.log(event)
          
        }
        // TODO: use the tempo info
        // console.log(event)
      }
    }

    if (this.songInfo.lyricsBackup.length > 3 * this.songInfo.lyrics.length) {
      console.log('lyrics is not located in meta text');
      this.songInfo.lyrics = this.songInfo.lyricsBackup;
      // TODO: re-upload
    }

    delete this.songInfo.lyricsBackup;

    for (var segmentId in this.notesByTrack) {
      if (this.notesByTrack[segmentId].notes.length === 0) {
        delete this.notesByTrack[segmentId];
      } else {
        // annotate to find the early melody later.
        var track = this.notesByTrack[segmentId];
        var trackNotes = track.notes;

        if (trackNotes.length > 0) {
          trackNotes[0].isStart = true;
          trackNotes[trackNotes.length - 1].isEnd = true;
        }

        track.instrumentCode = channelToInstrument[track.channel];
        // console.log(track);
        // console.log(track.instrumentCode);
        if (typeof track.instrumentCode === 'number') {
          track.instrumentCategory = instrumentCodeToCategory(track.instrumentCode);
        }
      }


      // compute activeDuration and melodicColor to choose the mainTrack
      // compute noiseColor and number of low repeating notes to remove useless tracks
        
    }
  },

  smartShift: function(bestShift) {
    // Find a shift that produces the least number of sharps
    if (isNaN(bestShift)) {
      var minNumBlackKeys = Infinity;
      var bestShift = 0;

      for (var j = 0; j < 12; j++) {
        numBlackKeys = 0;

        for (var i = 0; i < Math.min(this.notes.length, 100); i++) {
          if (isBlackKey(this.notes[i].note + j)) {
            numBlackKeys++;
          }
        }

        if (numBlackKeys < minNumBlackKeys) {
          minNumBlackKeys = numBlackKeys;
          bestShift = j;
        }
      }

      // Shift to the correct octave
      var prevDiff = diffOfOutKeys(this.notes, bestShift);

      if (prevDiff < 0) {
        var currDiff = diffOfOutKeys(this.notes, bestShift+12);
        if (Math.abs(currDiff) < Math.abs(prevDiff)) {
          bestShift += 12;
        }
      } else {
        var currDiff = diffOfOutKeys(this.notes, bestShift-12);

        if (Math.abs(currDiff) < Math.abs(prevDiff)) {
          bestShift -= 12;
        }
      }
    }

    for (var i = 0; i < this.notes.length; i++) {
      this.notes[i].note += bestShift;
    }
  },

  annotateKeyCode: function() {
    // translate
    for (var i = 0; i < this.notes.length; i ++) {
      var noteNumber = this.notes[i].note;
      var keyCode = window.noteToKeyCode[noteNumber];

      if (!keyCode) {
        while (noteNumber > 84) {
          noteNumber -= 12;
        } 
        while (noteNumber < 47) {
          noteNumber += 12;
        }

        keyCode = window.noteToKeyCode[noteNumber];
      }

      this.notes[i].keyCode = keyCode;
      this.notes[i].note = noteNumber;
    }    
  },

  createTranslatedSong: function(callback) {
    Meteor.call('createTranslatedSong', this.notes, this.notesByTrack, this.songInfo, this.channels, this.rawData, function(err, songId) {
      if (err) {
        alert(err.reason);
      } else {
        callback(songId);
      }
    });
  }
}
  



function isBlackKey(i) {
  var blackKeys = [1, 3, 6, 8, 10];

  i -= 60; // TODO: use middleC instead
  i = (i % 12) + (i < 0 ? 12 : 0);

  return (blackKeys.indexOf(i) > -1)
}

function diffOfOutKeys(notes, shift) {
  // Difference of over the range vs under the range keys
  var diff = 0;
  for (var i = 0; i < Math.min(notes.length, 200); i++) {
    var note = notes[i].note;
    // console.log(note + shift);

    var newNote = note + shift;
    if (newNote > 84) {
      if ([86, 88, 89, 90, 91, 93].indexOf(newNote) > -1) {
        diff += 2; // note that I hate high notes more than low notes
      } else {
        diff += 100; // notes that need to be shifted down sound really bad
      }
    } else if (note + shift < 47) {
      diff -= 1;
    }
  }
  return diff;
}

