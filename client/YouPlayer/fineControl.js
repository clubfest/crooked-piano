Template.fineControl.rendered = function() {
  Session.set('visibleTab', 'infoTab')
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

Template.fineControl.tonality = function() {
  return Session.get('tonality') || 'Tonality';
}

Template.fineControl.sampleSize = function() {
  return Session.get('sampleSize');
}

Template.fineControl.shift = function() {
  return Session.get('shift');
}

Template.fineControl.isSynchronous = function() {
  return Session.get('isSynchronous');
}

Template.fineControl.mainInstrumentName = function() {
  if (song.segments && song.mainTrack) {
    return song.segments[song.mainTrack].text;
  }
}

Template.fineControl.mainTrack = function() {
  return Session.get('mainTrack');
}