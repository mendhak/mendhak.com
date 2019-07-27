
Static site for mendhak.com

Uses [supersized](https://github.com/buildinternet/supersized) to show the full-screen images. It's an old library but does the job pretty well and is super minimal.  
Considered using [nano gallery 2](https://nanogallery2.nanostudio.org/) but the performance is poor in Firefox. It's the best featured of all options.   
Also considered using [Photoswipe](https://photoswipe.com) but it has no auto-play feature and doesn't come close to going as full screen as possible.  Though it's quite responsive and mobile friendly, the main target is desktop. 

Added use of the [touchswipe](https://github.com/mattbryson/TouchSwipe-Jquery-Plugin) plugin, at a minor level.  If the JS detects a touchscreen device, a touch listener is added.  Swiping right or left simply clicks the forward/backward buttons.  I could not find how to invoke the `api.nextSlide()` in supersized.  Additionally the slide transition changes to swipe for mobile, instead of fade on desktop.  

I had to make some tweaks to supersized.  Upgraded to JQuery 3.x and using `.on()` events. 

The Flickr URLs aren't concatenated any more, they are requested using the Flickr API `extras=url_k,url_o` which returns the large and original image sizes.  If a `k` size image is not available, the script falls back to the original size image.  This is to allow displaying older Flickr images for which the `k` size doesn't exist.  

