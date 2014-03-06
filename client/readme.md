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

How to recognize the chords
===========================

* Remove the melodic part unless we need more info
* Local min or more than 3 notes implies a change


Flow of uploader
================

* Upload a song directly or using add-on
  * Prompt to sign in if not done so
* Play, adjust and then save/gamify
  * default shifting to C major scale
  * default volume to be 1.1
* Perform and save the progress
* View the progress with a list of recommendation with similar chord progression
* Share the performance

Flow of a new user
==================

* Got linked to a performance
* Click play and start playing
* When saving progress, user is prompted to sign in

Profile
=======

* List of songs uploaded
* Link to playlist of progresses

Playlist
========

* Embedded progress page with autoplay and sort options

Progress
========

* performer's name
* autoplay a shuffled list of songs you performed

LeadPlayer Options
==================
Title
Result
Navigation
Piano
(Lyrics)
Tabbed options

* Description
  * Blurb
  * Video
  * Comment
* Music
  * Notations
    * Default to Do Re Mi
  *  Shifting Global tone
    * Default to C major / A minor
  * Local Tone
* Effects
  * Speed
  * Main Track Volume
  * Difficulty

Editting Options
================
Requires us to id the notes
Use idCounter

* Commentary
* Lyrics
* Track
  * Select a beat
  * Display the beat visually

Monetization
============

* Performance analysis

New Features
============

## segmentRecorder
The goal is to make it easier for recording music

* Display the segments so one can choose which segment to use
  * Need UI for selecting and unselecting segments
  * Need functions to merge and unmerge
* Have a way to snap notes together or to the beat
  * design a new tablature system
  * Need UI for displaying and selecting notes
  * Need to transfer those changes to each segment

## analyzer

* analyze the difference between the instruction and performance
  * translate this into useful advice of how to play better
  * finger placement advice
  * piano finger placement: require AI
