MidiReplayer: the Central Controller
====================================

* When certain events reaches MidiReplayer, it sets session variables
  * Displays and Views render the changes
  * Controllers react and set other session variables or trigger events

Example
=======

* When lyrics or text reaches MidiReplayer, we use Session.lyrics
  * lyricsDisplay will display changes if that template exists

* When we enter slow mode, MidiReplayer will only proceed if our Session.noteQueue is empty
  * Once its empty, it keeps going.

* When we enter edit mode, MidiReplayer will only proceed if our Session.noteQueue is nonempty