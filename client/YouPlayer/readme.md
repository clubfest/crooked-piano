youPlayer
=========

* Initialize the youPlayer when the template is created (only once)
* Then set up the song

## What is proximateNotes

`updateProximateNotes` for sparse music:
* quit if the end has been reached
* if `proximateNotes` is empty
  * get the next note via playIndex
  * increment the playIndex
  * if the note is a down key
    * add it to `proximateNotes`
    * display the note
    * if it's a computer note
      * play it after the computed wait time

`updateProximateNotes` for dense music:
* if `proximateNotes` is not empty
  * peek at the next note 
  * if the time from the previous note is less than 100ms
    * add it to `proximateNotes`
    * display it accordingly
  * else return

## LeadPlayer 
* `proximateNotes` are the next correct note. There can be more than 1 note if within less than 100ms
* `computerProximateNotes` are the next notes to be played by the computer if `proximateNotes` are empty
  * Otherwise It but must wait to play together with `proximateNotes`.

* will not be played until proximateNotes is empty
* 
* after computerProximateNotes are played, we will need to update proximateNotes

* Everytime, a note match, we check if proximateNotes are all computerNotes
  * If so, play, all those notes.

We should separate proximateComputerNotes from proximateNotes with the update:

* if it's a computer note, don't play it yet
  * reorder the non-computer notes are first
  * if they are at the front
    * play the computer notes 
  * else set timeout
    * and add to the timeout if needed



## mode
* one-hand: Play one segment.
* lead: Computer will play the other segments, and wait for you.
* accompanied: Computer will play notes from other segments
* sing-along: the keyboardDown characters are replaced by do-re-mi
* duet: Normal speed for the other segments
* recital: Delayed display of notes, and end with playing the whole song in one go
* two-handed: Everything is played by the user