// Track websites opened and keep a list of valid tabs to block on
//  we'll reference these tabs in the listener
reseteraTabs = {};

chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    // We receive all requests for supported host images so we must filter
    //  for resetera.com
    if( !info.tabId || info.tabId == -1 ) // unrelated to a tab
      return;

    reseteraTabs[info.tabId] = true;

//    console.log("++ Restera tab(" + info.tabId + "): " + info.url
//      + " (total: " + Object.keys(reseteraTabs).length + ")");

    return;
  },
  // filters
  {
    urls: [
      "*://*.resetera.com/*"
    ],
    types: ["main_frame"]
  },
  // extraInfoSpec
  ["blocking"]
);

// Remove tabs from list when navigated away from
chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if( changeInfo.status && (changeInfo.status == "complete") )
    {
      if( !reseteraTabs[tabId] )
        return;

      delete reseteraTabs[tabId];
//      console.log("-- tab(" + tabId + ") removed <updated> " + " (total: "
//        + Object.keys(reseteraTabs).length + ")");
    }
  }
);

chrome.tabs.onRemoved.addListener(
  function(tabId, removeInfo) {
    if( !reseteraTabs[tabId] )
      return;

    delete reseteraTabs[tabId];
//    console.log("-- tab(" + tabId + ") removed <removed> " + " (total: "
//      + Object.keys(reseteraTabs).length + ")");
  }
);

chrome.tabs.onReplaced.addListener(
  function(addedTabId, removedTabId) {
    if( !reseteraTabs[removedTabId] )
      return;

    delete reseteraTabs[removedTabId];
//    console.log("-- tab(" + removedTabId + ") removed <replaced> " + " (total: "
//      + Object.keys(reseteraTabs).length + ")");
  }
);

// Block GIFs from supported hosts
//  page injection will later turn this into video embeds
chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    // We receive all requests for supported host images so we must filter
    //  for resetera.com
    if( !info.tabId || info.tabId == -1 ) // unrelated to a tab
      return;

    if( !reseteraTabs[info.tabId] ) // not a resetera tab
      return;

    var newurl = info.url;

    // gfycat (giant.gfycat.com URL scheme)
    var p = info.url.search( "://giant.gfycat.com/" );
    if( p >= 0 )
    {
      var extpos = info.url.lastIndexOf( ".gif" );
      var uniquename = info.url.substring( p+20, extpos );
      newurl = info.url.substring( 0, p );
      newurl = newurl + "://thumbs.gfycat.com/" + uniquename + "-poster.jpg";
    }

    // gfycat (thumbs.gfycat.com URL scheme)
    var p = info.url.search( "://thumbs.gfycat.com/" );
    if( p >= 0 )
    {
      var extpos = info.url.lastIndexOf( ".gif" );
      var uniquename = info.url.substring( p+21, extpos );
      var h = uniquename.search( "-" );
      if( h >= 0 )
        uniquename = uniquename.substring( 0, h );
      newurl = info.url.substring( 0, p );
      newurl = newurl + "://thumbs.gfycat.com/" + uniquename + "-poster.jpg";
    }

    // imgur
    p = info.url.search( ".imgur.com/" );
    if( p >= 0 )
    {
      var extpos = info.url.lastIndexOf( ".gif" );
      var uniquename = info.url.substring( p+11, extpos );
      newurl = info.url.substring( 0, info.url.search(":") );
      newurl = newurl + "://i.imgur.com/" + uniquename + "h.jpg"; // h suffix for 'huge' thumbnail
    }

    // giphy (media.giphy.com URL scheme)
    p = info.url.search( ".giphy.com/media/" );
    if( p >= 0 )
    {
      var extpos = info.url.lastIndexOf( "/giphy.gif" );
      var uniquename = info.url.substring( p+17, extpos );
      newurl = info.url.substring( 0, info.url.search(":") );
      newurl = newurl + "://media.giphy.com/media/" + uniquename + "/giphy_s.gif"; // _s suffix for 'still'
    }

    // giphy (i.giphy.com URL scheme)
    p = info.url.search( "://i.giphy.com/" );
    if( p >= 0 )
    {
      var extpos = info.url.lastIndexOf( ".gif" );
      var uniquename = info.url.substring( p+15, extpos );
      newurl = info.url.substring( 0, p );
      newurl = newurl + "://media.giphy.com/media/" + uniquename + "/giphy_s.gif"; // _s suffix for 'still'
    }

//    console.log("Resetera tab(" + info.tabId + ") redirected " + info.url + " to " + newurl );

    return {redirectUrl: newurl};
  },
  // filters
  {
    urls: [
      "*://giant.gfycat.com/*.gif",
      "*://thumbs.gfycat.com/*.gif",
      "*://i.imgur.com/*.gif",
      "*://*.giphy.com/media/*/giphy.gif",
      "*://i.giphy.com/*.gif"
    ],
    types: ["image"]
  },
  // extraInfoSpec
  ["blocking"]
);

// gfycat:
// The "poster" image, which is the same dimensions as the original is at
// http(s)://thumbs.gfycat.com/gfyName-poster.jpg
//
// There are also standard size thumbnail images at
// thumbs.gfycat.com/gfyName-thumb50.jpg and thumb100.jpg
// (for 50px hight and 100px high)
//
// imgur:
// The "poster" image has the same name of the gifv but with the jpg extension.
// It seems as if some server magic is going on though as using the jpg as an
// normal image just seems to get the GIF version served. Instead we use the
// the 'huge' (up to 1024x1024) thumbnail that imgur generates.
//
// giphy:
// Images and alternates are stored with a folder at
// media.giphy.com/media/<unique id>/<type>.gif
// A still image is /giphy_s.gif and can be used as the poster image.
//
//
