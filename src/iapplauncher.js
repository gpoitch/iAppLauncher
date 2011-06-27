/* 
 * iAppLauncher.js
 * v1.1
 * Garth Poitras <garth22@gmail.com>
 * A javascript class to launch iPhone apps from a web page.
 * Scenario: On arriving to page it prompts user about the app.  If they confirm it opens the app (if installed) and if not installed takes them to the itunes store to download.
 * Cookies are set to automatically launch the app when they go to the page again, or not prompt them if they opted out of opening the app.
 * options:
 *		urlScheme: the url scheme set up in the app. i.e. Facebook is "fb://"
 * 		appStoreUrl: itunes url to download the app. i.e. Facebook is "itms://itunes.apple.com/us/app/facebook/id284882215?mt=8"
 *		cookieName: name of the cookie to remember the users preference i.e. "iphone_app_prompt_facebook"
 *		promptMessage: optional custom message when prompting
 *		autoLaunchMessage: optional custom message when auto launching app
 *		messageDelay: optional delay(ms) to show messaging
 */
 
 
var iAppLauncher = function(options) {
	
	//check if they are on an iOS device
	var iOS = navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/);
	if (!iOS) return; //if they aren't just exit now
	
	var self = this;
	
	//public properties
	this.urlScheme = options.urlScheme;
	this.appStoreUrl = options.appStoreUrl;
	this.cookieName = options.cookieName;
	this.promptMessage = options.promptMessage ? options.promptMessage : "An iPhone App is available. Would you like to launch it now?";
	this.autoLaunchMessage = options.autoLaunchMessage ? options.autoLaunchMessage : "Opening in iPhone App...";
	this.messageDelay = 500;
	this.prefersApp = false;
	
	//public methods
	this.launchApp = function() {
		doLaunch();
	};
	
	this.prompt = function() {
		iphoneAppPrompt();
	};

	//initialize
	(function init() {
		//check preference from cookie
		if(checkCookie()==="denied") {
			return; //already prompted, and said no, just stay on page
		}
		else if(checkCookie()==="confirmed") {
			//already prompted, and said yes, launch app automatically
			windowOnLoad(function() {
				setTimeout(function() {
					alert(self.autoLaunchMessage);
					doLaunch();
				}, self.messageDelay); //short delay so they can see the page briefly
			});
			return;	
		}
		
		//no cookie preference was set yet, so prompt the user about the app when the page loads
		windowOnLoad(function() {
			setTimeout(iphoneAppPrompt, self.messageDelay); //short delay so they can see the page briefly
		});
	
	})();
	
	//Prompt's user that an App is available.  Attempts to launch the app if confirmed. Sets cookie with their choice.
	function iphoneAppPrompt() {
		if(confirm(self.promptMessage)) {
			setCookie(self.cookieName, "confirmed", 90);
			self.prefersApp = true;
			doLaunch();
		}
		else {
			setCookie(self.cookieName, "denied", 90); //set cookie not to prompt again	
		}
	}
	
	//creates and fires a link containing an href to the app's url scheme and a failure fallback onclick event
	function doLaunch() {
		var appLaunchLink = document.createElement('a'); 
		appLaunchLink.setAttribute('href', self.urlScheme);
		appLaunchLink.onclick = attemptLaunch();
		var customEvent = document.createEvent("UIEvents");
	  	customEvent.initEvent("click", false, false);
	  	appLaunchLink.dispatchEvent(customEvent);		
	}
	
	//Attemps to launch the app... if they dont have the app it redirects them to the app store to download it
	function attemptLaunch(){
	    return function(){
	        var clickedAt = +new Date;
	        setTimeout(function(){
	            // To avoid failing on return to MobileSafari, ensure freshness!
	            if (+new Date - clickedAt < 2000){
	                window.location = self.appStoreUrl; // To avoid the "protocol not supported" alert, fail must open another app.
	            }
	        }, 500); // During tests on 3g/3gs this timeout fires immediately if less than 500ms.
	    };
	}
	
	//standard window onload that retains any other window onload events that may have been set elsewhere
	function windowOnLoad(onLoadFnc) {
		if ( window.onload != null ) {
      		var oldOnload = window.onload;
      		window.onload = function (e) {
      			onLoadFnc();
        		oldOnload(e);
      		};	
		}
		else {
			onLoadFnc();
		}		
	}
	
	//Cookie helper functions
	function getCookie(c_name) {
	    var i, x, y, ARRcookies = document.cookie.split(";");
	    for (i = 0; i < ARRcookies.length; i++) {
	        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
	        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
	        x = x.replace(/^\s+|\s+$/g, "");
	        if (x == c_name) {
	            return unescape(y);
	        }
	    }
	}
	function setCookie(c_name, value, exdays) {
	    var exdate = new Date();
	    exdate.setDate(exdate.getDate() + exdays);
	    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	    document.cookie = c_name + "=" + c_value;
	}
	function checkCookie() {
	    var cookieValue = getCookie(self.cookieName);
	    if (cookieValue != null) {
	        return cookieValue;
	    }
	    return null;
	}

}