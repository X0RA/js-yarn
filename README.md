# Yarn JS
This is a very small web renderer for Yarn JSON files, like a little choose your own adventure that can be hosted on 'tiiny.site'. At this point in time it does not support the full range of features Yarn has to offer but has the core fundamentals. [Yarn desktop client](https://github.com/YarnSpinnerTool/YarnEditor/releases)

## To do list 

 - [x] Dialogue and options
 - [x] Pictures
 - [x] Videos
 - [x] Ability to specify who's talking with "Person: talking" on new line and click through dialogue
 - [x] Fix sizing for more options
 - [ ] Sub option dialogue / Shortcut options supported by arrows '->' 
 - [ ] Nested shortcut options?
 - [ ] Alternative themes?
 - [ ] Jumps
 - [ ] Conditionals / Expressions / Vairables (store in cookie??) 
## Usage
This is pretty stripped down. This currently has support for initial dialogue, choices and a accompanying image or video file (in mp4 format (webm didn't work on iphones?)). 

> Today Mittens and Yizzard are walking through the forest. They encounter a fork in the road, which way should they go?
[[Right|1right_node]]
[[Left|1left_node]]
[img]https://github.com/laxmimerit/dog-cat-full-dataset/raw/master/data/test/cats/cat.10135.jpg[/img]

This will render the starting text and the options below them. It will also preload the image and place it above the text. 

You can also instead specify a video in the following format:

> [video]https://github.com/danomoseley/keyboardcat/raw/master/assets/meow.webm[/video]



## Setup
The only edit that is needed is to update the link in the get dialogue function within the js file. This link has to be a direct link to the .json file. 

    function getDialogue() {
	    return new Promise(function (resolve) {
		    fetch("JSON FILE HERE")

What I did was download the dropbox sync client, then use the [Yarn desktop client](https://github.com/YarnSpinnerTool/YarnEditor/releases) to save the file in the dropbox sync. 
Afterwards I am able to get public share link (going to dropbox and clicking share) then edit the url slightly so it looks like the following:

Original:
https://www.dropbox.com/s/qwertyuiop123/exampleyarn.json?dl=0
Edited:
https://dl.dropboxusercontent.com/s/qwertyuiop123/exampleyarn.json

This allowed me to just ctl+s for the website to update and remove the need for manual file uploading

***NOTE:*** If you are doing lots of edits, it may be a good idea to turn off the chache in your browser, for chrome right click and select inspect (ctl + shift + i) then click the network tab, then check the "disable cache" checkbox. This will ensure it re-downloads the json file each time the page is loaded.