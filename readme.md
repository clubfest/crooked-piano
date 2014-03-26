Install
=======

I am using the unstable version of meteor, so you will need meteorite to take care of the dependencies

```
sudo npm install -g meteorite
```

Of course, you will need to install meteor
```
curl https://install.meteor.com/ | sh
```

And finally run meteorite

```
mrt
```

## TODO

1. Get lyrics working
2. Get note edit working
3. Get instrument acceptable

Version Control
===============

* song.userLyrics and song.userComments consists of userId to lyrics and text meta events
  * The user lyrics to be displayed will default to those with highest number of items 
  * Show comments button at the end.
  * Animated comment will not update until 4 seconds except for the uploader's comment.
* song.userTracks will be a track that the user adds to the song with trackId given by incrementing trackIndex

MVP
===

* Game page will be simple
  *
  * an edit button will create a songFork.
* Editting page will also be simple.

Buttons
=======

* Remove useless finger down button
* When demo is paused, we require player to click the next note to proceed.

Drive
=====
Allow saving your stuff to google drive in midi or kar

Allow midi and kar file to be opened using my app using google drive
Figure out if phones can download file to google drive
This will allow accessing midi file in your cell phone

* Check out how files can be downloaded to drive

Lyrics
======
First, you view an existing song
When you get to a certain point
You want to insert lyrics
  You will need to click the edit tab
  Go to the textbox, type the word and press enter
  There will be left and right arrow buttons to navigate
  
Save the edit to the user's SongCustomizations

Notes Editting
==============

Don't:

* modify existing note
* modify spacing unless in push mode
* fix up improv pieces

Do:

* You will always be in the context of a track (new or existing)
* navigate using a rest with the tiniest interval specified (1/4 beat)
* insert notes and rest into the current rest
* delete current selection (except if it is the last one, then delete the previous note)
  * i.e. it's a delete that becomes a backspace if it's in the last position

Scenario:

* User wants to change something in the existing midi
  * change to insert mode and navigate using left and right arrow (buttons)
  * modify the notes in that track; we will update song.notes
  * if switched track or saved, we will propagate the change to that track in song.midi
  * switching track will move to the closest previous (next) note


## TODO Later

* Fill in the best shift

* redirect non-user to sign in

* snap notes together both in time and in tone
* Add slow recording

* paginate
* most recent
* most played

* youtube api for description and commenting
* include youtube description to help with searching

* Have user input lyrics and parse it by understanding the true melody
  * Separate a tune and lyrics into paragraphs
  * Separate them into phrases


## Recognize Chords

diff = 3 means NE
diff = 4 means E

The rest depends on what recent notes are played to connect them

3 3 = diminished (1)
3 4 = minor (1)
4 3 = major (1)
4 4 = augmented (?)
5 4 = major (2)
5 5 = sus4 (2)

3 3 3 = diminished 7 (?)
3 3 4 = minor 6 (2)



C-major: 0, 4, 7
G#-major: 0, 3, 8
F-major: 0, 5, 9

C-minor: 0, 3, 7
A-minor: 0, 4, 8
F-minor: 0, 5, 8
  
  

