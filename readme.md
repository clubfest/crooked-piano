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
  
  

