Schema for Song
===============
{
  info: {
    ticksPerBeat: 96,
    title:
  },
  midi: {
    
    sharedEvents: [],
    tracks: {
      0: {
        sharedEvents: [],
        channel: {
          0: [],
          1: []
        }
      }
    }
  }
}

Process
=======

* MidiFile: bytes -> MidiFile
  * Intermediate form separated by trackId
  * Obtain musicalTracks before combining
  
* Converter.getMusicalTracks: MidiFile -> musicalTracks 
  * It contains the beatLocation and beatDuration but no timing info
  * but setTempo events are still part of these tracks
    * assigned to the preceding event's channel
* Converter.getMusicalNotes: musicalTracks -> musicalNotes
  * combine muscialTracks to musicalNotes similar to how replayer.js does it
  * need info so that it is edittable and insertable

Musical Notes are more fundamental than Notes

To make it easy to edit

* I must have the beatLocation and beatDuration
* How should I incorporate setTempo?



Song
====

* consists of notes and tracks
* consists of musicalNotes and musicalTracks

MidiToSong
==========

* use the info in the MidiFile to convert to musicNotes
  * see Replayer for details of merging
  * this is crucial if we want to modify
  * dynamic timeInfo
* use the channel and track to separate
* use the setTempo to obtain the sheetNotes

MusicalNotesToNotes
===================

* Imitate what Replayer is doing

SongToMidi
==========

* should be easy using jsmidi or more modern repo