Songs
=====
We will annotate the notes with info so that when we merge various segments later, we can distinguish them.

Song object is of the form
{
  'title': String,
  'desc': String,
  'notes': Array[Note],
  'segments': Object{ segmentId: {'notes': Array[Note]} },
  'createdAt': Date,
  'createdBy': String,
  'creatorId': String,
}

* segments is the ultimate instruction and can be editted
* notes is re-created after each edit
  * It contains order info needed when editting and creating the game

Note object is of the form
{
  'isKeyboardDown': Boolean,
  'keyCode': Integer,
  'note': Integer,
  'time': Integer,
  'segmentId': Integer,
}

* note is used to generate the keyCode
* keyCode is used to display how to play the correct note
* time is used to compute duration of the note.



This is outdated info:

users
=====
It will contain 
games: {
  songId___: {
    segmentLevel: 2,
    leftHandLeadSegments: {
      segmentId___: [],
      segmentId___: [],
    },
    rightHandLeadSegments: [],
    rightHandLeadSong: [],
    leftHandLeadSong: [],
  }
}