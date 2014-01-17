Monotrome
=========

This helps createSong

## how to store this info
The frequency and the time of the first beat needs to be stored in the recording

## how can the info be used
When one plays a song, the beat will be inserted at the right time via:

* (1 - fractionalPart((currNote.time - firstBeat.time) frequency)) / frequency

We will think of how to use this to line up different segments, such as adding a beat
