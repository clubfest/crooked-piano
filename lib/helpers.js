
clone = function (o) {
  if (typeof o != 'object') return (o);
  if (o == null) return (o);
  var ret = (typeof o.length == 'number') ? [] : {};
  for (var key in o) ret[key] = clone(o[key]);
  return ret;
};