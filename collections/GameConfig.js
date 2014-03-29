
// identified the createdAt of a gamification; sort of like a git commit
GameConfig = new Meteor.Collection('gameConfig');

Meteor.methods({
  createGameConfig: function(hash) {
    var user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(413, 'Not Signed In');
    }

    hash.createdAt = new Date;
    hash.userId = user._id;
    hash.userName = 'anonymous';
    hash.shared = false;

    if (user.headGameConfigs && user.headGameConfigs[hash.songId]) {
      var prevGameConfigId = user.headGameConfigs[hash.songId]._id;
      if (prevGameConfigId) {
        hash.prevGameConfigId = prevGameConfigId;
      }
    }

    var gameConfigId = GameConfig.insert(hash); // use return value

    // update user info
    var userUpdate = {};
    userUpdate['headGameConfigs.' + hash.songId] = gameConfigId;

    Meteor.users.update(user._id, {
      $set: userUpdate,
    });

    return gameConfigId; // may be used in the song
  },

  updateGameConfig: function(hash) {
    // find the headGameConfig and update it.
  },

  shareGameConfig: function(hash) {
    // share the user's gameConfig when he hits gamify
    GameConfig.update(hash._id, {
      $set: {shared: true},
    });

    // TODO the song's gameConfig will need to be updated if the master's head is changed
  }
});



// var gameConfig = {
//   songId: 'songId',
//   userId: 'userId',
//   userName: 'anonymous',
//   createdAt: new Date,
//   public: false,
//   nextGameConfig: 'gameConfigId'
//   speed: 1,
//   shift: 0,
//   tuning: 0,
//   volume: 1,
//   tracks: [1, 2, 5],
//   lyricsTrack: [3],
//   textTrack: [2, 3],
// }