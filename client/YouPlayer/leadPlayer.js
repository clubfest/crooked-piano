var song;
var isPreview;

Template.leadPlayer.created = function() {
  song = this.data.song;

  Session.set('playSpeed', song.speed || 1);
  Session.set('shift', song.shift || 0);
  Session.setDefault('isSynchronous', true);
  Session.set('backgroundVolume', song.backgroundVolume || 0.8);
  Session.set('sampleSize', 10);
  isPreview = true;

  LeadPlayer.create(song);
}

Template.leadPlayer.rendered = function() {

  Deps.autorun(function() {
    $('.play-slider').slider({
      range: "min",
      min: 0,
      max: Session.get('playLength'),
      value: LeadPlayer.getPlayIndex(),

      slide: function(evt, ui) {
        LeadPlayer.reset(ui.value);
        LeadPlayer.updateProximateNotes();
      },
    });
  });

  Deps.autorun(function() {
    if ((Session.get('playIndex') % (Session.get('sampleSize') / 2) === 0)) {
      Session.set('tonality', getTonality(Session.get('sampleSize')));
    }
  }); 

  $('#speed-slider').slider({
    range: 'min',
    min: .1,
    max: 1.4,
    step: 0.05,
    value: Session.get('playSpeed'),
    slide: function(evt, ui) {
      Session.set('playSpeed', ui.value);
    },
  }); 

  $('#background-volume-slider').slider({
    range: 'min',
    min: 0,
    max: 1.5,
    step: 0.1,
    value: Session.get('backgroundVolume'),
    slide: function(evt, ui) {
      Session.set('backgroundVolume', ui.value);
    },
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
  'click #synchronous': function() {
    Session.set('isSynchronous', true);
  },

  'click #asynchronous': function() {
    Session.set('isSynchronous', false);
    LeadPlayer.transferProximateNotesToComputer();
  },
  
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

  'click #sample-up': function() {
    Session.set('sampleSize', Session.get('sampleSize') + 1);
    Session.set('tonality', getTonality(Session.get('sampleSize')));
  },

  'click #sample-down': function() {
    Session.set('sampleSize', Session.get('sampleSize') - 1);
    Session.set('tonality', getTonality(Session.get('sampleSize')));
  },

  'click #display-guitar': function() {
    Session.set('displayGuitar', !Session.get('displayGuitar'));
  },
});

Template.leadPlayer.lyrics = function() {
  return Session.get('lyrics');
}

Template.leadPlayer.displayGuitar = function() {
  return Session.get('displayGuitar');
}

Template.advancedControl.tonality = function() {
  return Session.get('tonality') || 'Tonality';
}

Template.advancedControl.sampleSize = function() {
  return Session.get('sampleSize');
}

Template.advancedControl.shift = function() {
  return Session.get('shift');
}

Template.advancedControl.isSynchronous = function() {
  return Session.get('isSynchronous');
}

Template.advancedControl.mainInstrumentName = function() {
  if (song.segments && song.mainTrack) {
    return song.segments[song.mainTrack].text;
  }
}

Template.advancedControl.mainTrack = function() {
  return Session.get('mainTrack');
}

Handlebars.registerHelper('isPaused', function() {
  return Session.get('isPaused');
});

function displayNoteDistribution() {
  var noteDistribution = getNoteDistribution(200); // 100 is arbitrary

  for (var i = 0; i < noteDistribution.length; i++) {
    var keyCode = convertNoteToKeyCode(72 + i);
    var dom = $('[data-key-code="' + keyCode + '"]');

    dom.html('<span>' + noteDistribution[i] + '</span>');
  }
}

OCTAVE = 12;
getNoteDistribution = function(surveyLength) {
  var currIdx = LeadPlayer.getIndex();
  var notes = LeadPlayer.playNotes.slice(currIdx, currIdx + surveyLength);

  var noteDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];      
    var noteNumber = note.note + Session.get('shift');
    
    // statistics
    noteDistribution[noteNumber % OCTAVE] += 1;
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


