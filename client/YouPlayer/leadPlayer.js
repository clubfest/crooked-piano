var song;
var isPreview;

Template.leadPlayer.created = function() {
  song = this.data.song;

  Session.set('playSpeed', song.speed || 1);
  Session.set('shift', song.shift || 0);
  Session.setDefault('isSynchronous', true);
  isPreview = true;

  LeadPlayer.create(song);
  console.log('created');
}

Template.leadPlayer.rendered = function() {
  if (!this.rendered) {
    this.rendered = true;

    Deps.autorun(function() {
      $('.play-slider').slider({
        range: "min",
        min: 0,
        max: Session.get('playLength'),
        value: LeadPlayer.getPlayIndex(),
      });
    }); 
  }

  $('.play-slider').slider({
    slide: function(evt, ui) {
      LeadPlayer.reset(ui.value);
      LeadPlayer.updateProximateNotes();
    },
  });

  if (isPreview) {
    var self = this;
    Deps.autorun(function() {
      var song = self.data.song;
      if (song.notes) {
        LeadPlayer.setPlayNotes(song.notes);
        isPreview = false;
        console.log('reloaded');
      }
    });
  }

  LeadPlayer.redisplayNotes();

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

  // 'click #start': function() {
  //   Session.set('isPaused', false);
  // },
  
  'click #demo': function() {
    // players[Session.get('playLevel')].demo();
    LeadPlayer.demo();
  },

  'click #pause-demo': function() {
    // players[Session.get('playLevel')].pauseDemo();
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
});

Template.leadPlayer.shift = function() {
  return Session.get('shift');
}

Template.leadPlayer.isSynchronous = function() {
  return Session.get('isSynchronous');
}

Template.leadPlayer.loadProgress = function() {
  var loadProgress = Session.get('loadProgress') || 1;
  return Math.floor(loadProgress * 100 / 12);
}

Handlebars.registerHelper('isPaused', function() {
  return Session.get('isPaused');
});

function displayNoteDistribution() {
  var currIdx = LeadPlayer.getPlayIndex();
  var notes = LeadPlayer.playNotes.slice(currIdx, currIdx + 100); // 100 is arbitrary

  var noteStatistics = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];      
    var noteNumber = note.note + Session.get('shift');
    
    // statistics
    noteStatistics[noteNumber % 12] += 1;
  }

  for (var i = 0; i < noteStatistics.length; i++) {
    var keyCode = convertNoteToKeyCode(72 + i);
    var dom = $('[data-key-code="' + keyCode + '"]');

    dom.html('<span>' + noteStatistics[i] + '</span>');
  }
}


