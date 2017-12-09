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

window.addEventListener('scroll', checkVisibility, false);
window.addEventListener('resize', checkVisibility, false);
window.addEventListener('load', checkVisibility, false);

// fallback for when video not found
function imgur_fallback( video )
{
	console.log( "imgur fallback for video error: " + video.name );

	var imggif = document.createElement( "img" );
	imggif.src = scheme + "://i.imgur.com/" + video.name + ".jpg";
	imggif.type = "image/gif";

	video.parentNode.replaceChild( imggif, video );
}

// Go through all the img elements in the page and see what we got
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
	var rewrite = image_src.match( "giant.gfycat.com/.*[\.gif]$" );
	if( rewrite )
	{
		var p = image_src.search( "://giant.gfycat.com/" );
		if( p >= 0 )
		{
			var extpos = image_src.lastIndexOf( ".gif" );
			var uniquename = image_src.substring( p+20, extpos );

			var scheme = image_src.substring( 0, p );

			// replace this node with a video element
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
			vid.poster = scheme + "://thumbs.gfycat.com/" + uniquename + "-poster.jpg";
			vid.className = 'eravidgif';
			vid.addEventListener( 'click', fullVideo, false );

			vid.appendChild( mp4zippy );
			vid.appendChild( mp4fat );
			vid.appendChild( mp4giant );
			image.parentNode.replaceChild( vid, image );
		}
	}

	// imgur
	rewrite = image_src.match( "\\imgur.com/.*(.gif)$" );
	if( rewrite )
	{	
		var p = image_src.search( "imgur.com/" );
		if( p >= 0 )
		{
			var extpos = image_src.lastIndexOf( ".gif" );
			var uniquename = image_src.substring( p+10, extpos );
			console.log( "found '" + uniquename + "' @ " + image_src );

			var scheme = image_src.substring( 0, image_src.search(":") );

			// replace this node with a video element
			var vid = document.createElement( "video" );
			vid.name = uniquename;
			vid.muted = true;
			vid.autoplay = false;
			vid.loop = true;
			vid.poster = scheme + "://i.imgur.com/" + uniquename + "h.jpg"; // h suffix for 'huge' thumbnail
			vid.className = 'eravidgif';
			vid.addEventListener( 'click', fullVideo, false );

			var mp4gifv = document.createElement( "source" );
			// HACK: always use http because of broken https weirdness on resetera
//			mp4gifv.src = "http://i.imgur.com/" + uniquename + ".mp4";
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

	// giphy
	rewrite = image_src.match( "i.giphy.com/.*(.gif)$" ) ||
			image_src.match( "media[0-9]?.giphy.com/media/.*(/giphy.gif)$" ) ||
			image_src.match( "media[0-9]?.giphy.com/media/.*(/source.gif)$" );

	if( rewrite )
	{
		var extpos = 0;
		var uniquename = "";
		var scheme = "";

		p = image_src.search( ".giphy.com/media/" );
		if( p >= 0 )
		{
			extpos = image_src.lastIndexOf( "/" );
			uniquename = image_src.substring( p+17, extpos );
			console.log( "found '" + uniquename + "' @ " + image_src );

			scheme = image_src.substring( 0, image_src.search(":") );
		}
		else
		{
			p = image_src.search( "://i.giphy.com/" );
			if( p >= 0 )
			{
				extpos = image_src.lastIndexOf( ".gif" );
				uniquename = image_src.substring( p+15, extpos );
				console.log( "found '" + uniquename + "' @ " + image_src );

				scheme = image_src.substring( 0, p );
			}
		}

		if( p >= 0 )
		{
			// replace this node with a video element
			var mp4gifv = document.createElement( "source" );
			mp4gifv.src = scheme + "://media.giphy.com/media/" + uniquename + "/giphy.mp4";
			mp4gifv.type = "video/mp4";

			var vid = document.createElement( "video" );
			vid.name = uniquename;
			vid.muted = true;
			vid.autoplay = false;
			vid.loop = true;
			vid.poster = scheme + "://media.giphy.com/media/" + uniquename + "/giphy_s.gif"; // _s suffix for 'still'
			vid.className = 'eravidgif';
			vid.addEventListener( 'click', fullVideo, false );

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

			vid.appendChild( mp4gifv );
			image.parentNode.replaceChild( vid, image );
		}
	}
}
