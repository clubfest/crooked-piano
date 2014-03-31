
average = function(a) {
  var r = {mean: 0, variance: 0}, t = a.length;
  for(var m, s = 0, l = t; l--; s += a[l]);
  for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow((a[l] - m) / t, 2));
  r.variance = s;
  return r;
}

variance = function(arr) {
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    total += arr[i];
  }

  var average = total / arr.length;

  var dev = 0;
  for (var i = 0; i < arr.length; i++) {
    dev += Math.abs(arr[i] - average) / total;
  }

  return dev;
}