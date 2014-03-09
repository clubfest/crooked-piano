
Template.tracksTab.rendered = function() {
  var song = this.data.song;

  $('#track-select').on('change', function(){
    LeadPlayer.switchTrack(parseInt(this.value));
  });

  $('.track-checkbox').on('change', function() {
    if (this.checked) {
      var method = 'removeTrack';
    } else {
      var method = 'unremoveTrack';
    }

    var segmentId = parseInt(this.value);

    LeadPlayer.reset(0);


    Meteor.call(method, song._id, segmentId, function(err, notes) {
      if (err) {
        alert(err.reason);
      }else {
        LeadPlayer.reset(0);
        LeadPlayer.setPlayNotes(notes);
        LeadPlayer.updateProximateNotes();
      }
    });
  })
}

Template.tracksTab.isMainTrack = function() {
  var segment = this;
  return segment.segmentId === Session.get('mainTrack');
}