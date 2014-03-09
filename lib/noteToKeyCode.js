
keyCodeToNote = {
  67: 41,
  86: 42,
  70: 43,
  51: 45,
  192: 47,
  49: 48, // C
  50: 49,
  81: 50,
  87: 51,
  65: 52,
  90: 53,
  88: 54,
  83: 55,
  68: 56,
  69: 57,
  82: 58,
  52: 59,
  53: 60, // C
  54: 61,
  84: 62,
  89: 63,
  71: 64,
  66: 65,
  78: 66,
  72: 67,
  74: 68,
  85: 69,
  73: 70,
  56: 71,
  57: 72, //C
  48: 73,
  79: 74,
  80: 75,
  76: 76,
  190: 77,
  191: 78,
  186: 79,
  222: 80,
  219: 81,
  221: 82,
  187: 83,
  8: 84, //C
  220: 86,
  189: 88,
  77: 89,
  188: 90,
  75: 91,
  55: 93,
};

noteToKeyCode = {};

for (prop in keyCodeToNote) {
  noteToKeyCode[keyCodeToNote[prop]] = parseInt(prop);
}

convertNoteToKeyCode = function(noteNumber) {
  var keyCode = noteToKeyCode[noteNumber];

  if (!keyCode) {
    while (noteNumber > 84) {
      noteNumber -= 12;
    } 
    while (noteNumber < 47) {
      noteNumber += 12;
    }
    keyCode = noteToKeyCode[noteNumber];
  }

  return keyCode;
}

