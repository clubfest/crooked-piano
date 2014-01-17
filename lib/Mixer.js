Mixer = {
  mergeSort: function(arrays) {
    var ret = [];
    var i = 0;
    while (1) {
      if (i + 1 < arrays.length) {
        ret.push(Mixer.mergeSortTwo(arrays[i], arrays[i+1]));
        i += 2;
      } else if (i < arrays.length) {
        ret.push(arrays[i]);
        break;
      } else {
        break;
      }
    }

    if (ret.length > 1) {
      ret = Mixer.mergeSort(ret);
    }
    // ret should have length 1 at this point
    return ret;
  },

  mergeSortTwo: function(currArray, nextArray) {
    var newArray = [];

    var j = 0;
    for (var i = 0; i < currArray.length; i++) {
      var noteInCurr = currArray[i];
      while (j < nextArray.length) {
        var noteInNext = nextArray[j];
        if (noteInNext.time < noteInCurr.time) {
          newArray.push(noteInNext);
          j++;
        } else {
          break;
        }
      }
      newArray.push(noteInCurr);
    }
    // remaining recorded notes
    for (; j < nextArray.length; j++) {
      newArray.push(nextArray[j]);
    }
    return newArray;
  },
}