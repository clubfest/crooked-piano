var song;
var isPreview;
var GLOBAL_SAMPLE_SIZE = 200;
var LOCAL_SAMPLE_SIZE = 200;

Template.leadPlayer.created = function() {
  song = this.data.song;

  Session.set('playSpeed', song.speed || 1);
  Session.set('shift', song.shift || 0);
  Session.setDefault('isSynchronous', true);
  Session.set('backgroundVolume', song.backgroundVolume || 0.8);
  isPreview = true;

  LeadPlayer.create(song);
}

Template.leadPlayer.rendered = function() {
  Deps.autorun(function() {
    $('.play-slider').slider({
      range: "min",
      min: 0,
      max: Session.get('playLength'),
      value: Session.get('playIndex'),

      slide: function(evt, ui) {
        LeadPlayer.reset(ui.value);
        LeadPlayer.updateProximateNotes();
      },
    });
  });

  Deps.autorun(function() {
    if ((Session.get('playIndex') % (LOCAL_SAMPLE_SIZE / 2) === 0)) {
      Session.set('tonality', getTonality(LOCAL_SAMPLE_SIZE));
    }
  }); 

  if (isPreview) {
    var self = this;
    Deps.autorun(function() {
      var song = self.data.song;
      if (song.notes) {
        LeadPlayer.setPlayNotes(song.notes);
        isPreview = false;
      }
    });
  }

  LeadPlayer.redisplayNotes();
}

Template.leadPlayer.destroyed = function() {
  LeadPlayer.destroy();
}

Template.leadPlayer.events({  
  'click #demo': function() {
    LeadPlayer.demo();
  },

  'click #pause-demo': function() {
    LeadPlayer.pauseDemo();
  },

  'click #switch-track': function() {
    LeadPlayer.switchTrack();
  },

  'click #next-game': function() {
      LeadPlayer.saveGame();

      TempGames.merge();
      Router.go('profile');
  },

  'click #retry-game': function() {
    LeadPlayer.reset();
    LeadPlayer.updateProximateNotes();
  },

  'click #alphabet-notation': function() {
    Session.set('isAlphabetNotation', true);
  },

  'click #do-re-mi-notation': function() {
    Session.set('isAlphabetNotation', false);
  },

  'click #shift-up': function() {
    Session.set('shift', Session.get('shift') + 1);
    displayNoteDistribution();
  },

  'click #shift-down': function() {
    Session.set('shift', Session.get('shift') - 1);
    displayNoteDistribution();
  },

  // 'click #sample-up': function() {
  //   Session.set('sampleSize', Session.get('sampleSize') + 1);
  //   Session.set('tonality', getTonality(Session.get('sampleSize')));
  // },

  // 'click #sample-down': function() {
  //   Session.set('sampleSize', Session.get('sampleSize') - 1);
  //   Session.set('tonality', getTonality(Session.get('sampleSize')));
  // },

  'click #display-guitar': function() {
    Session.set('displayGuitar', !Session.get('displayGuitar'));
  },
});

Template.leadPlayer.currentLyrics = function() {
  return Session.get('lyrics');
}

Template.leadPlayer.displayGuitar = function() {
  return Session.get('displayGuitar');
}


Handlebars.registerHelper('isPaused', function() {
  return Session.get('isPaused');
});

function displayNoteDistribution() {
  var noteDistribution = getNoteDistribution(200); // 200 is arbitrary

  for (var i = 0; i < noteDistribution.length; i++) {
    var keyCode = convertNoteToKeyCode(72 + i);
    var dom = $('[data-key-code="' + keyCode + '"]');

    dom.html('<span>' + noteDistribution[i] + '</span>');
  }
}

OCTAVE = 12;

getGlobalTonality = function() {
  return getTonality(GLOBAL_SAMPLE_SIZE);
}

getNoteDistribution = function(sampleSize) {
  var currIdx = LeadPlayer.getIndex();
  var notes = LeadPlayer.playNotes;

  var noteDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (var i = currIdx; i < notes.length; i++) {
    if (i - currIdx > sampleSize) {
      break ;
    }

    var note = notes[i];      

    if (note.event === "noteOn") {
      var noteNumber = note.note + Session.get('shift');
      
      // statistics
      noteDistribution[noteNumber % OCTAVE] += 1;
    }
  }

  return noteDistribution;
}

getTonality = function(size) {
  var noteDist = getNoteDistribution(size);
  var majorTriadCount = [];
  var minorTriadCount = [];

  for (var i = 0; i < OCTAVE; i++) {
    var num = noteDist[0+i] + noteDist[(4+i)%OCTAVE] + noteDist[(7+i)%OCTAVE];
    majorTriadCount.push(num);
  }

  for (var i = 0; i < OCTAVE; i++) {
    var num = noteDist[0+i] + noteDist[(3+i)%OCTAVE] + noteDist[(7+i)%OCTAVE];
    minorTriadCount.push(num);
  }

  var majorMax = getMaxOfArray(majorTriadCount);
  var minorMax = getMaxOfArray(minorTriadCount);

  if (minorMax > majorMax) {
    var idx = minorTriadCount.indexOf(minorMax);
    var conversion = {
      0: 'C',
      1: 'D\u266D',
      2: 'D',
      3: 'E\u266D',
      4: 'E',
      5: 'F',
      6: 'G\u266D',
      7: 'G',
      8: 'A\u266D',
      9: 'A',
      10: 'B\u266D',
      11: 'B',
    };
    var tonality = conversion[idx] + ' minor';
  } else {
    var idx = majorTriadCount.indexOf(majorMax);
    var conversion = {
      0: 'C',
      1: 'C\u266F',
      2: 'D',
      3: 'D\u266F',
      4: 'E',
      5: 'F',
      6: 'F\u266F',
      7: 'G',
      8: 'G\u266F',
      9: 'A',
      10: 'A\u266F',
      11: 'B',
    };
    var tonality = conversion[idx] + ' major';
  }
  return tonality;

}

function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}


