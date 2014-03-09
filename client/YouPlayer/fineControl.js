Template.fineControl.rendered = function() {
  Session.set('visibleTab', 'tracksTab')
}

Template.fineControl.events({
  'click #clear-guitar': function() {
    $('.guitar-keyboard a span').html('');
  },

  'click .tab-heading': function(evt) {
    var name = evt.currentTarget.dataset.name;
    
    Session.set("visibleTab", name);
  }
});

Template.fineControl.infoTabSelected = function() {
  return Session.get('visibleTab') === 'infoTab';
}

Template.fineControl.soundTabSelected = function() {
  return Session.get('visibleTab') === 'soundTab';
}

Template.fineControl.tempoTabSelected = function() {
  return Session.get('visibleTab') === 'tempoTab';
}

Template.fineControl.theoryTabSelected = function() {
  return Session.get('visibleTab') === 'theoryTab';
}

Template.fineControl.tracksTabSelected = function() {
  return Session.get('visibleTab') === 'tracksTab';
}

Template.fineControl.tonality = function() {
  return Session.get('tonality') || 'Tonality';
}

Template.fineControl.sampleSize = function() {
  return Session.get('sampleSize');
}

Template.fineControl.isSynchronous = function() {
  return Session.get('isSynchronous');
}

Template.fineControl.mainInstrumentName = function() {
  var song = this.song;
  if (song.segments) {
    return song.segments[Session.get('mainTrack')].text;
  }
}

Template.fineControl.mainTrack = function() {
  return Session.get('mainTrack');
}