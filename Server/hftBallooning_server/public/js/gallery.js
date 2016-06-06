	/**
 * Gallery class
*/
function Gallery()
{
	function connectionEstablished()
	{
		SERVER_CONNECTOR.emitGetVideos(receiveMedia);
	}	
	
	function receiveMedia(bool, data)
	{
		// Check which video format is supported by the browser
		var mp4 = false;
		var ogg = false;
		
		if(supports_h264_baseline_video() == "probably")
			mp4 = true;
		else
		{
			if(supports_ogg_theora_video() == "probably")
				ogg = true;
			else
			{
				if(supports_h264_baseline_video() == "maybe")
					mp4 = true;
				else if(supports_ogg_theora_video() == "maybe")
					ogg = true;
				else
				{
					console.log("No video formats supported");
					return;
				}
			}
		}
		
		for(var i = 0; i < data.length; i++)
		{
			if(data[i] == null || data[i].indexOf("http") == -1)
				continue;
			
			// extract just the media url from the dropbox link
			var extensionLength = data[i].split("/")[data[i].split("/").length - 1].split(".")[1].split('"')[0].replace('"','').length;
			data[i] = data[i].slice(data[i].indexOf("http"), data[i].lastIndexOf(".")+extensionLength+1);
			
			var temp = data[i].split("/");
			var name = temp[temp.length - 1].split(".")[0];
			var extension = temp[temp.length - 1].split(".")[1].replace('"','');
			
			// add media object depending on its extension
			
			if(extension == "mp4" && mp4 == true)
			{
				$('#videoBox').append('<a target="_blank" href="' + data[i] + '"><video width="180" height="auto" margin-top="5px"><source src="' + data[i] + '" type="video/mp4"/></video></a>');
			}
			else if(extension == "ogg" && ogg == true)
			{
				$('#videoBox').append('<a target="_blank" href="' + data[i] + '"><video width="180" height="auto" margin-top="5px"><source src="' + data[i] + '" type="video/ogg"/></video></a>');
			}
			else if(extension.toLowerCase() == "png" || extension.toLowerCase() == "jpg")
			{
				$('#videoBox').append('<a target="_blank" href="' + data[i] + '"><img src="' + data[i] + '" alt="some_text" width="180" height="auto" margin-top="5px"></a>');
			}
		}
	}
	
	// check if mp4 supported (Macs and iPhones)
	function supports_h264_baseline_video() 
	{
	  if (!supports_video()) { return false; }
	  var v = document.createElement("video");
	  return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	}
	
	// check if ogg supported (firefox and other opensource browsers)
	function supports_ogg_theora_video() 
	{
	  if (!supports_video()) { return false; }
	  var v = document.createElement("video");
	  return v.canPlayType('video/ogg; codecs="theora, vorbis"');
	}
	
	function supports_video() 
	{
		return !!document.createElement('video').canPlayType;
	}

	//Subscribe at ServerConnector to get data
	SERVER_CONNECTOR.subscribeOnConnectionEstablished(connectionEstablished);
	if(USE_REST)
		SERVER_CONNECTOR.checkConnection();
}

$(document).ready(function () 
{
	var gallery = new Gallery();
});
