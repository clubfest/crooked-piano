Progresses = new Meteor.Collection('progresses');

if (Meteor.isClient) {
  TempGames = {
    incomplete: [],
    complete: null,
    merge: function() {
      if (this.incomplete.length === 0) return;

      var firstGame = this.incomplete[0];
      var result = firstGame.notes;
      var offset = 0

      for (var i = 1; i < this.incomplete.length; i++) {
        var prevGame = this.incomplete[i - 1];
        var game = this.incomplete[i];

        offset += game.startTime - prevGame.endTime - (game.originalStartTime - prevGame.originalEndTime); 

        for (var j = 0; j < game.notes.length; j++) {
          var note = game.notes[j];
          note.time -= offset;
          result.push(note);
        }
      }

      this.complete = {
        songId: firstGame.songId,
        title: firstGame.title,
        version: firstGame.version,
        notes: result,
      };

      this.incomplete = [];
    },
  };
}

Meteor.methods({
  saveTempGamesToUser: function(complete) {
    var userId = Meteor.userId();

    if (!userId) {
      throw new Meteor.Error('513', 'Not Signed In');
    }

    Progresses.upsert({
      userId: userId,
      songId: complete.songId,
      title: complete.title,
      version: complete.version,
    }, {
      $set: {
        notes: complete.notes,
        createdAt: new Date(),
      }
    });
  },

  updateLastVisitedGame: function(songId) {
    var userId = Meteor.userId();

    Meteor.users.update(userId, {
      $set: {lastVisitedGame: songId}
    })
  },
});