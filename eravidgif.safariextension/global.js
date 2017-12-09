var block_rules = [
	{
	    "trigger": {
	        "url-filter": "https?://giant.gfycat.com/[a-z]+.gif$",
	        "url-filter-is-case-sensitive": "false",
	        "resource-type": ["image"],
	        "load-type": ["third-party"]
	    },
	    "action": {
	        "type": "block"
	    }
	},

	{
	    "trigger": {
	        "url-filter": "https?://i.imgur.com/[a-z0-9]+.gif$",
	        "url-filter-is-case-sensitive": "false",
	        "resource-type": ["image"],
	        "load-type": ["third-party"]
	    },
	    "action": {
	        "type": "block"
	    }
	},

	{
	    "trigger": {
	        "url-filter": "https?://i.giphy.com/[a-z0-9]+.gif$",
	        "url-filter-is-case-sensitive": "false",
	        "resource-type": ["image"],
	        "load-type": ["third-party"]
	    },
	    "action": {
	        "type": "block"
	    }
	},

	{
	    "trigger": {
//	    	"if-top-url": "https?://*.resetera.com/*",
	        "url-filter": "https?://media[0-9]?.giphy.com/media/[a-z0-9]+.giphy.gif$",
	        "url-filter-is-case-sensitive": "false",
	        "resource-type": ["image"],
	        "load-type": ["third-party"]
	    },
	    "action": {
	        "type": "block"
	    }
	}
];


eraTabs = {}

function enableBlocking() {
	safari.extension.setContentBlocker(block_rules);
	console.log( "enable resetera videogif blocking" );
}

function disableBlocking() {
	safari.extension.setContentBlocker(null);
	console.log( "disable resetera videogif blocking" );
}

function beforeNavigateHandler(msg) {
	if( msg.url != null )
	{
		if( Object.keys(eraTabs).length == 0 )
			enableBlocking();
		eraTabs[msg.target] = msg.url;
	}
	else if( eraTabs[msg.target] )
	{
    	delete eraTabs[msg.target];
		if( Object.keys(eraTabs).length == 0 )
			disableBlocking();		
	}
}

function navigateHandler(msg) {
	if( eraTabs[msg.target] )
	{
    	delete eraTabs[msg.target];
		if( Object.keys(eraTabs).length == 0 )
			disableBlocking();
	}
}

function closeHandler(msg) {
	if( eraTabs[msg.target] )
	{
    	delete eraTabs[msg.target];
		if( Object.keys(eraTabs).length == 0 )
			disableBlocking();
	}
}


//enableBlocking();
//safari.application.addEventListener("beforeNavigate", beforeNavigateHandler, true);
//safari.application.addEventListener("navigate", navigateHandler, true);
//safari.application.addEventListener("close", closeHandler, true);

console.log("resetera videogif global.js executed!");
