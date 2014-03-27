
Template.editTab.created = function() {
  Session.set('showEditor', false);
}

Template.editTab.events({
  'click #create-track': function(evt, tmpl) {
    Meteor.call('createTrack', tmpl.data.song._id, 'Untitled', function(err, trackId) {
      if (err) {
        alert(err.reason);
      } else {
        Session.set('showEditor', true);
        Editor.init(trackId);
      }
    });
  },
  
  'click .fork-track': function(evt, tmpl) {
    Meteor.call('createTrack', tmpl.data.song._id, 'Untitled', function(err, trackId) {
      if (err) {
        alert(err.reason);
      } else {
        Session.set('showEditor', true);
        Editor.init(trackId);
      }
    });
  },
});

Template.editTab.showEditor = function() {
  return Session.get('showEditor');
}