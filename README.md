#Alarm

This is a simple demo/concept of an alarm clock implemented using HTML5 technology.

It supports alarm clock using flexible phrases like "in a minutes", "after 10 minutes", "13:14" or "8:20pm".

When timed out, it plays a song from Youtube using Youtube's JavaScript API, and while there's an option to set a local file, it is not implemented :P

Also, only the song used for the alarm is remembered, and the app doesn't remember the alarms you set after reload.

Works best on Webkit, and Firefox and IE10 are supported too! But ironically, while the interface is designed to be mobile-friendly, it won't work on mobile safari because videos/audios cannot be played on mobile safari [unless it's initiated by a user action](http://stackoverflow.com/questions/4259928/how-can-i-autoplay-media-in-ios-4-2-1-mobile-safari).

You can try it out [here](http://yjyao.com/projects/alarm/main.html).
