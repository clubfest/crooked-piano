
Template.soundTab.rendered = function() {
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
}

Template.soundTab.globalTonality = function() {
  return "C major";
}

Template.soundTab.globalTonalityCertainty = function() {
  return "95%";
}

Template.soundTab.shift = function() {
  return Session.get('shift');
}