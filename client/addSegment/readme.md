addSegment
========
The simplest way to extend a song
* record the new notes
* push the new notes to the segments list
* merge the new notes with the notes

## More complex situations
We will leave adding variations to the improv mode, where
* a new song is created based on the gameId
  * no song is created if the user already has that gameId
  * the corresponding segment is replaced
* the old song will be linked to the new song as sharedVariations if approved
* the new notes are pushed into the song's variationSegments
* the game will use the annotated segmentId to remove old notes

About the game modes:

* solo (80% correct)
* for each variation
  * synchronized duet (80% correct, time < 2 * duration)

* do-re-mi mode, delay the display by 2 seconds,

* delayed do-re-mi mode

* slow duet (80% correct within 1 second window)
* normal duet (80% correct within 1 second window)
* improv (nothing displayed)
* next in the segments list