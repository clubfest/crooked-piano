
Template.trackStat.rendered = function() {
}

Template.trackStat.rythmicJumpFrequencies = function() {
  var rets = [];

  for (trackId in this.song.trackInfos) {
    var rythmicJumpFrequencies= this.song.trackInfos[trackId].rythmicJumpFrequencies;
    var ret = [];
    for (jump in rythmicJumpFrequencies) {
      ret.push({jump: parseFloat(jump.replace(',', '.')), frequency: rythmicJumpFrequencies[jump]});
    }

    ret.sort(function(a, b) {
      return Math.abs(a.jump) - Math.abs(b.jump);
    });

    rets.push({frequencies: ret, trackId: trackId});
  }
  return rets;
}

Template.trackStat.melodicJumpFrequencies = function() {
  var rets = [];

  for (trackId in this.song.trackInfos) {
    var trackInfo = this.song.trackInfos[trackId];
    var melodicJumpFrequencies= trackInfo.melodicJumpFrequencies;
    var ret = [];

    for (jump in melodicJumpFrequencies) {
      if (jump < 0) {
        if (!melodicJumpFrequencies[-jump]) {
          melodicJumpFrequencies[-jump] = 0;
        }
        melodicJumpFrequencies[-jump] += melodicJumpFrequencies[jump];
      }
    }
    for (jump in melodicJumpFrequencies) {
      if (jump >= 0) {
        ret.push({jump: jump, frequency: melodicJumpFrequencies[jump]});
      }
    }

    ret.sort(function(a, b) {
      return Math.abs(a.jump) - Math.abs(b.jump);
    });

    rets.push({
      frequencies: ret, 
      trackId: trackId, 
      trackName: trackInfo.trackName,
      instrumentInfo: trackInfo.instrumentInfo,
    });
  }
  return rets;
}