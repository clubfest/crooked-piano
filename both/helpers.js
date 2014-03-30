
average = function(a) {
  var r = {mean: 0, variance: 0}, t = a.length;
  for(var m, s = 0, l = t; l--; s += a[l]);
  for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
  r.variance = s / t;
  return r;
}