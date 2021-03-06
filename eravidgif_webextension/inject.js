// console.log( "running resetera videogif inject.js" );

// fallback for when video not found
function imgur_fallback( video )
{
//	console.log( "imgur fallback for video error: " + video.name );

	var imggif = document.createElement( "img" );
	imggif.src = scheme + "://i.imgur.com/" + video.name + ".jpg";
	imggif.type = "image/gif";

	video.parentNode.replaceChild( imggif, video );
}

// Go through all the img elements in the page and replace them
var allImages = document.images;

for( var i = allImages.length-1; i >= 0; i-- )
{
	var image = allImages[i];
	var image_src = "";

	if( 'src' in image )
		image_src = image.src;
	
	if( image_src == "" && ('dataset' in image) && ('src' in image.dataset) )
		image_src = image.dataset.src;

//	console.log( "found image @ " + image_src );

	// Gfycat
	var rewrite = image_src.match( "giant.gfycat.com/.*(.gif)$" ) ||
					image_src.match( "thumbs.gfycat.com/.*[\.gif]$" );

	if( rewrite )
	{
		var extpos = 0;
		var uniquename = "";
		var scheme = "";
		var usemobile = false;

		var p = image_src.search( "://giant.gfycat.com/" );

		if( p>= 0 )
		{
			var extpos = image_src.lastIndexOf( ".gif" );
			var uniquename = image_src.substring( p+20, extpos );
			var scheme = image_src.substring( 0, p );			
		}
		else
		{
			p = image_src.search( "://thumbs.gfycat.com/" );
			if( p >= 0 )
			{
				extpos = image_src.lastIndexOf( "-" );
				if( extpos < 0 )
				{
					extpos = image_src.lastIndexOf( ".gif" );
				}
				else
				{
					var postfix = image_src.substring( extpos, image_src.length-4 );
//					console.log( "found postfix '" + postfix + "' on " + image_src );
					if( postfix == "-size_restricted" || postfix == "-small" )
						usemobile = true;
				}

				uniquename = image_src.substring( p+21, extpos );
				scheme = image_src.substring( 0, p );

				var h = uniquename.search( "-" );
				if( h >= 0 )
					uniquename = uniquename.substring( 0, h );
			}			
		}

		if( p >= 0 )
		{
//			console.log( "found '" + uniquename + "' @ " + image_src );

			// replace this node with a video element
			var mp4mobile = document.createElement( "source" );
			mp4mobile.src = scheme + "://thumbs.gfycat.com/" + uniquename + "-mobile.mp4";
			mp4mobile.type = "video/mp4";

			var mp4zippy = document.createElement( "source" );
			mp4zippy.src = scheme + "://zippy.gfycat.com/" + uniquename + ".mp4";
			mp4zippy.type = "video/mp4";

			var mp4fat = document.createElement( "source" );
			mp4fat.src = scheme + "://fat.gfycat.com/" + uniquename + ".mp4";
			mp4fat.type = "video/mp4";

			var mp4giant = document.createElement( "source" );
			mp4giant.src = scheme + "://giant.gfycat.com/" + uniquename + ".mp4";
			mp4giant.type = "video/mp4";

			var vid = document.createElement( "video" );
			vid.name = uniquename;
			vid.muted = true;
			vid.autoplay = false;
			vid.loop = true;
			vid.className = 'eravidgif';

			if( usemobile )
			{
				vid.poster = scheme + "://thumbs.gfycat.com/" + uniquename + "-mobile.jpg";
				vid.appendChild( mp4mobile );				
			}
			else
			{
				vid.poster = scheme + "://thumbs.gfycat.com/" + uniquename + "-poster.jpg";
				vid.appendChild( mp4giant );
				vid.appendChild( mp4fat );
				vid.appendChild( mp4zippy );
			}
			image.parentNode.replaceChild( vid, image );
		}
	}

	// imgur
	rewrite = image_src.match( "\\i.imgur.com/.*(.gif)$" );
	if( rewrite )
	{
		var p = image_src.search( "i.imgur.com/" );
		if( p >= 0 )
		{
			var extpos = image_src.lastIndexOf( ".gif" );
			var uniquename = image_src.substring( p+12, extpos );
//			console.log( "found '" + uniquename + "' @ " + image_src );

			var scheme = image_src.substring( 0, image_src.search(":") );

			// We only want larger images. If the poster image has not finished loading
			// this will fail and we will end up pulling video by default. Small images
			// should load quick and be cached so good enough I say.
			if( image.naturalHeight > 0 && image.naturalHeight <= 64 )
			{
				// small image, just use the normal GIF. We mangle the extension
				// in a Imgur friendly manner to avoid hitting the cache and getting
				// the cached .gif - which will be a placeholder poster image for
				// video because we redirected the URL fetch using the WebRequest API
				var imggif = document.createElement( "img" );
				imggif.src = scheme + "://i.imgur.com/" + uniquename + ".jpg";
				imggif.type = "image/gif";
				image.parentNode.replaceChild( imggif, image );
			}
			else
			{
				// replace this node with a video element
				var vid = document.createElement( "video" );
				vid.name = uniquename;
				vid.muted = true;
				vid.autoplay = false;
				vid.loop = true;
				vid.poster = scheme + "://i.imgur.com/" + uniquename + "h.jpg"; // h suffix for 'huge' thumbnail
				vid.className = 'eravidgif';

				var mp4gifv = document.createElement( "source" );
				mp4gifv.src = scheme + "://i.imgur.com/" + uniquename + ".mp4";
				mp4gifv.type = "video/mp4";
				mp4gifv.onerror = (function(error) {
					var thisvid = vid;
					return function () { return imgur_fallback(thisvid); }
				})();

				vid.appendChild( mp4gifv );
				image.parentNode.replaceChild( vid, image );
			}
		}
	}

	// giphy
	rewrite = image_src.match( "i.giphy.com/.*(.gif)$" ) ||
			image_src.match( ".giphy.com/media/.*(/giphy.gif)$" );
	if( rewrite )
	{		
		var extpos = 0;
		var uniquename = "";
		var scheme = "";

		var p = image_src.search( "://i.giphy.com/" );
		if( p >= 0 )
		{
			extpos = image_src.lastIndexOf( ".gif" );
			uniquename = image_src.substring( p+15, extpos );
//			console.log( "found '" + uniquename + "' @ " + image_src );

			scheme = image_src.substring( 0, p );
		}
		else
		{
			p = image_src.search( ".giphy.com/media/" );
			if( p >= 0 )
			{
				extpos = image_src.lastIndexOf( "/giphy.gif" );
				uniquename = image_src.substring( p+17, extpos );
//				console.log( "found '" + uniquename + "' @ " + image_src );

				scheme = image_src.substring( 0, image_src.search(":") );
			}
		}

		if( p >= 0 )
		{
			// replace this node with a video element
			var mp4src = document.createElement( "source" );
			mp4src.src = scheme + "://media.giphy.com/media/" + uniquename + "/giphy.mp4";
			mp4src.type = "video/mp4";
			var vid = document.createElement( "video" );
			vid.name = uniquename;
			vid.muted = true;
			vid.autoplay = false;
			vid.loop = true;
			vid.poster = scheme + "://media.giphy.com/media/" + uniquename + "/giphy_s.gif"; // _s suffix for 'still'
			vid.className = 'eravidgif';

			// Create an image element shared with the poster image so that
			//	we can fire an onload event and resize
			var posterimage = document.createElement( "img" );
			posterimage.onload = (function() {
				var thisvid = vid;
				return function () {
					thisvid.width = this.naturalWidth;
					thisvid.height = this.naturalHeight;
				};
			})();

			posterimage.src = vid.poster;

			vid.appendChild( mp4src );
			image.parentNode.replaceChild( vid, image );
		}
	}	

}

function isElementVisible(el) {
    var rect     = el.getBoundingClientRect();
    var docEl    = document.documentElement;
    var vWidth   = window.innerWidth || docEl.clientWidth;
    var vHeight  = window.innerHeight || docEl.clientHeight;

    // Return false if it's not in the viewport
    if( rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight )
        return false;

    return true;
} 

function checkVisibility() {
	let videos = document.querySelectorAll( "video.eravidgif" );

	for( var i = 0; i < videos.length; i++ )
	{
		var vid = videos[i]
		if( isElementVisible(vid) ) {
			if( vid.paused ) {
				vid.play();
//				console.log( "playing " + vid.name );
			}
		} else {
			if( !vid.paused ) {
				vid.pause();
//				console.log( "pausing " + vid.name );
			}
		}
	}
}

var ticking = false;
function debouncedCheckVisibility() {
	if( !ticking ) {
		window.requestAnimationFrame( function() {
			checkVisibility();
			ticking = false;
		});
	}
	ticking = true;
}

window.addEventListener('scroll', debouncedCheckVisibility, false);
window.addEventListener('resize', debouncedCheckVisibility, false);
window.addEventListener('load', checkVisibility, false);

// Will call XenForo.checkQuoteSizing() to add 'click to expand' div on quoted video
window.dispatchEvent(new Event('resize'));

