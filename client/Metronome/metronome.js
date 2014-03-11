var $indicator;
var indicatorIncreasing = true;
var interval = null;
var MAX = 100;
var period = 200;
var INCREMENT = 5;
var numDownKeys = 0;

Template.metronome.destroyed = function() {
  MetronomeRecorder.destroy();
}

Template.metronome.rendered = function() {
  MetronomeRecorder.init();

  $('#metronome-speed-slider').slider({
    range: 'min',
    min: 50,
    max: 1000,
    step: 50,
    value: period,
    slide: function(evt, ui) {
      MetronomeRecorder.period = ui.value;
      // period = ui.value;
    },
  });

  $('#beats-per-measure-slider').slider({
    range: 'min',
    min: 2,
    max: 32,
    step: 1,
    value: 8,
    slide: function(evt, ui) {
      SheetDrawer.beatsPerMeasure = ui.value;
      // MetronomeRecorder.period = ui.value;
      // period = ui.value;
    },
  });

  $indicator = $('#metronome-indicator');
  $indicator.slider({range: 'min', min: 0, max: MAX});

  Deps.autorun(function() {
    $indicator.slider('value', Session.get('indicatorValue'));
  });

  SheetDrawer.init();
  Deps.autorun(function() {
    SheetDrawer.setNotes(Session.get('recordedNotes'));
    SheetDrawer.draw();
  });
}

// function incrementIndicator(increment) {
//   increment = increment || 5;
//   var value = $indicator.slider('value');
//   if (indicatorIncreasing) {
//     if (value < 100) {
//       $indicator.slider('value', value + increment);
//     } else {
//       $indicator.slider('value', value - increment);
//       indicatorIncreasing = false;
//     }
//   } else {
//     if (value > 0) {
//       $indicator.slider('value', value - increment);
//     } else {
//       $indicator.slider('value', value + increment);
//       indicatorIncreasing = true;
//     }
//   }
// }

// function stopIndicator() {
//   window.clearInterval(interval);
//   interval = null;

//   var value = $indicator.slider('value');
//   if (value < MAX / 2) {
//     $indicator.slider('value', 0);
//   } else {
//     $indicator.slider('value', MAX);
//   }
// }
Template.metronome.events({
  'click #save-recording': function() {
    MetronomeRecorder.save();
  }
})
