Redesign of Piano
=================

* Make it look like a youtube player, with demo, youplay buttons (default on, but switches off on demo)
* Add space bar and arrow keys if we are editing

Redesign of SheetDrawer
=======================

* Only allow one voice per track by taking the minimum duration until next note arrive
* That means things will not be displayed correctly unless you split the voices up 1 per track.
  * I will make it easy to split a track into 2 tracks, by having you pick the note or hit space

SimpleDrawer
============

* Everything will be displayed correctly
* Use fraction and background color for duration display
* Advanced editting capabilities
  * key click means same position
  * key press will progress the position
  * right arrow at the end means extend the current note
  * space insert rest
  * up and down shift the octave
  * edit mode only unless you are insert rest

Lyrics input
============

* Create lyrics edit mode
* hitting enter skip to the next note

loadMeasures
============

* first loop thru notes, leave the notes uncut
* second loop thru each measure, cut the notes and move them to the front of the next measure (create it)
  * this will take care of notes longer than 2 measures as well

Draw
====

* load notes into 4 measures
* for each measure
  * draw a stave
  * compute and draw a voice
    * fill measure with rests
    * TODO: add additional rest-padded voices if necessary
    * TODO: handle non-standard duration using ties
    * TODO: keep track of leftovers and how they are tied to this stave's notes


Vex
===

* We will have all the info the the midi events, such as custom rest event
* We will have temporary notes padded by rest
* dynamically increase the number of voices

Sheet
=====

* Beat, Duration and Note
* Draw the notes given
* Give the correct number of notes

How to process data
===================

* Save the raw data just in case.

What to include in events:

* noteOn
* noteOff
* programChange for a channel
* trackName for a track (can correspond to multiple channel) vs program
* meta text vs lyrics