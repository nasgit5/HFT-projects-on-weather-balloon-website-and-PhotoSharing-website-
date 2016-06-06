/**
 * ServerConnector class
*/

function ServerConnectorNODEJS(url)
{
	var self = this;
	var serverurl = url;
	
	//Subscribers
	var subscribersOnCurrentData = new Array();
	var subscribersOnFormerData = new Array();
	var subscribersOnViewChanged = new Array();
	var subscribersOnConnectionEstablished = new Array();
	
	var socket;
	
	//Connect to server
	self.connect = function()
	{
		console.log("connecting");
		socket = io.connect(SERVER_BASE_URL);	
		socket.on('jsonData', self.onJSONData);
		broadcastConnectionEstablished();
	}
	
	//Handle incoming data from server
	self.onJSONData = function(data)
	{
		broadcastCurrentData(data);
	}
	
	//Subscription on getting current data
	self.subscribeOnCurrentData = function(callback)
	{
		subscribersOnCurrentData.push(callback);
	}
	
	//Subscription on getting former data
	self.subscribeOnFormerData = function(callback)
	{
		subscribersOnFormerData.push(callback);
	}
	
	//Subscription on view changed by user
	self.subscribeOnViewChanged = function(callback)
	{
		subscribersOnViewChanged.push(callback);
	}
	
	//Subscription on server connection establishment information
	self.subscribeOnConnectionEstablished = function(callback)
	{
		subscribersOnConnectionEstablished.push(callback);
	}
	
	//Send incoming data to all subscribers on current data
	function broadcastCurrentData(data)
	{
		var json = jQuery.parseJSON(data);
		
		if(json != undefined && json != null && json.length > 0)
		{
			for(var j = 0; j < json.length; j++)
			{
				if(jQuery.isEmptyObject(json[j])){continue;}
			
				for (var i = 0; i < subscribersOnCurrentData.length; i++) 
				{
					subscribersOnCurrentData[i](json[j]);
				}
			}
		}
	}
	
	//Send incoming data to all subscribers on connection established
	function broadcastConnectionEstablished()
	{
		for (var i = 0; i < subscribersOnConnectionEstablished.length; i++) 
		{
			subscribersOnConnectionEstablished[i]();
		}
	}
	
	//Emit signal to server to retrieve data between two timestamps. Invoked by TimeSlider
	self.emitViewChanged = function(params)
	{		
			socket.emit('getData', params, function(err, data) {
			if (err)
				console.log('error');
			
			var jsonArray = jQuery.parseJSON(data);
			
			for (var i = 0; i < subscribersOnViewChanged.length; i++) 
			{
				subscribersOnViewChanged[i](jsonArray);
			}
		});
	}
	
	//Emit signal to server to retrieve start and end dataset of flight
	self.emitGetFlightDates = function(params, callback)
	{
		socket.emit('getFlightDates', params, function(err, data) 
		{
			if (err)
				console.log('error');
			
			var jsonArray = jQuery.parseJSON(data);
			
			var params = '{\"format\":\"json\",\"date\":\"' + jsonArray[jsonArray.length - 1].date + '\",\"dataset\":\"first\"}';
			socket.emit('getData', params, function(err, data1) 
			{
				if (err)
					console.log('error');
		
				var params = '{\"format\":\"json\",\"date\":\"' + jsonArray[jsonArray.length - 1].date + '\",\"dataset\":\"last\"}';
				socket.emit('getData', params, function(err, data2) 
				{
					if (err)
						console.log('error');
			
					callback(jQuery.parseJSON(data1), jQuery.parseJSON(data2));
				});
			});
		});
	}
	
	
	//Emit signal to server to retrieve data between two timestamps. Invoked by Timeslider
	self.emitGetFormerData = function(params)
	{
		socket.emit('getData', params, function(err, data) {
			if (err)
			{
				console.log('error on getData from Server');
				return;
			}
			
			var jsonArray = jQuery.parseJSON(data);
			
			//check if data valid 
			if (jsonArray == undefined || jsonArray == null || jsonArray.length == 0 || jQuery.isEmptyObject(jsonArray[0])) 
			{ 
				console.log("Error"); 
				return; 
			} 
			for (var i = 0; i < subscribersOnFormerData.length; i++) 
			{
				subscribersOnFormerData[i](jsonArray);
			}
		});
	}
	
	//Emit signal to server to retrieve videos
	self.emitGetVideos = function(callback)
	{
		var params = '{\"type\":\"getPreviewLink\", \"folderName\":\"\"}';
		//socket.emit('getVideos', { my: 'videos' });
		socket.emit('getDropboxLinks', params, callback);
	}
}

function ServerConnectorREST(url)
{
	var self = this;
	var serverurl = url + "/data?format=json";
	var connected = false;
	
	var connectionTestRequest = createRequest();
	checkConnection();
	
	var periodicRequest = createRequest(); 
	var date = new Date(); // local-time (as this is used by the server)
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	date = date.toJSON().replace("T", " ");
	periodicAjaxRequest();	
	
	// Used to gather data after a user interaction
	var singleRequest = createRequest(); 
	
	//Subscriptions
	var subscribersOnCurrentData = new Array();
	var subscribersOnFormerData = new Array();
	var subscribersOnViewChanged = new Array();
	var subscribersOnConnectionEstablished = new Array();
	
	self.subscribeOnCurrentData = function(callback)
	{
		subscribersOnCurrentData.push(callback);
	}
	self.subscribeOnFormerData = function(callback)
	{
		subscribersOnFormerData.push(callback);
	}
	self.subscribeOnViewChanged = function(callback)
	{
		subscribersOnViewChanged.push(callback);
	}
	self.subscribeOnConnectionEstablished = function(callback)
	{
		subscribersOnConnectionEstablished.push(callback);
	}
	
	function createRequest()
	{
		var result = null;
		if (window.XMLHttpRequest)
		{
			// FireFox, Safari, etc.
			result = new XMLHttpRequest();
			if (typeof result.overrideMimeType != 'undefined') 
			{
				result.overrideMimeType('text/xml'); 
			}
		} 
		else if (window.ActiveXObject) 
		{
			// MSIE
			result = new ActiveXObject("Microsoft.XMLHTTP");
		} 
		else 
		{ 
			console.log("Error while creating http request");
			return;
		}
		return result;
	}
	
	// Create the callback
	periodicRequest.onreadystatechange = function() 
	{
		// Check received answer
		var resp = checkAnswer(periodicRequest);
		
		// Error Handling
		if(resp == null)
			return
		if(typeof(resp[0].daterec)=='undefined')
			return;
			
		// Broadcast current data
		broadcastCurrentData(resp[0]);
	}
	
	function checkAnswer(req)
	{
		if (req.readyState != 4) return; // Not there yet
		
		// !document.domain -> localhost, status = 200 -> no error, 304 -> nothing changed
		if (document.domain && req.status != 200 && req.status != 304) 
		{
			console.log("Error - req.status: " + req.status + ", req.statusText: " + req.statusText);
			return;
		}
		
		// Request successful, read the response and broadcast it
		var resp = jQuery.parseJSON(req.responseText);
		
		return resp;
	}

	function broadcastCurrentData(data)
	{
		// Changing date, so next time a new object will be loaded
		date = data.daterec;
		
		for (var i = 0; i < subscribersOnCurrentData.length; i++) 
		{
			subscribersOnCurrentData[i](data);
		} 
	}	
	
	function broadcastConnectionEstablished()
	{
		for (var i = 0; i < subscribersOnConnectionEstablished.length; i++) 
		{
			subscribersOnConnectionEstablished[i]();
		}
	}	
		
	function periodicAjaxRequest()
	{
		// Polling: ask server for next data packet
		periodicRequest.open("GET", serverurl+"&next="+date, true);
		periodicRequest.send();
		setTimeout(periodicAjaxRequest, 1000);
	}
	
	function checkConnection()
	{
		// Ask for flight dates once to see whether there is any data at all in the db
		connectionTestRequest.open("GET", serverurl + "&flightDates=true", true);
		connectionTestRequest.send();
		if(!connected)
			setTimeout(checkConnection, 1000);
			
		connectionTestRequest.onreadystatechange = function() 
		{
			// Broadcast etablished connection
			if(!connected)
			{
				broadcastConnectionEstablished();
			}
			connected=true;
		}
	}
	
	self.checkConnection = function()
	{
		connected = false;
		checkConnection();
	}
			
	//Emit signal to server to retrieve data between two timestamps. Invoked by TimeSlider
	self.emitViewChanged = function(params)
	{
		var dummyURL = serverurl + "&timestamp=" + (jQuery.parseJSON(params)).timestamp;
		dummyURL = dummyURL + "&seconds=" + (jQuery.parseJSON(params)).seconds;
		
		singleRequest.onreadystatechange = function() 
		{
			broadcast(singleRequest, subscribersOnViewChanged);
		}
	
		singleRequest.open("GET", dummyURL, true); 
		singleRequest.send();		
	}
	
	//Emit signal to server to retrieve data between two timestamps. Invoked by Timeslider
	self.emitGetFormerData = function(params)
	{
		var dummyURL = serverurl + "&timestamp=" + (jQuery.parseJSON(params)).timestamp;
		dummyURL = dummyURL + "&seconds=" + (jQuery.parseJSON(params)).seconds;
		
		singleRequest.onreadystatechange = function() 
		{
			broadcast(singleRequest, subscribersOnFormerData);
		}
		
		singleRequest.open("GET", dummyURL, true); 
		singleRequest.send();
	}
	
	function broadcast(request, subscribers)
	{
		var resp = checkAnswer(request);
		
		// Error Handling
		if(resp == null)
			return
		if(typeof(resp[0].daterec)=='undefined')
			return;
			
		for (var i = 0; i < subscribers.length; i++) 
		{
			subscribers[i](resp);
		}
	}
	
	// Emit signal to server to retrieve start and end dataset of flight
	self.emitGetFlightDates = function(params, callback)
	{
		var dummyURL = serverurl + "&flightDates=true";
		
		var data1, data2, actualDate;
	
		singleRequest.onreadystatechange = function() 
		{
			var resp = checkAnswer(singleRequest);
			
			// Error Handling
			if(resp == null)
				return
			
			if(typeof(resp[resp.length - 1].date)!='undefined') // First: got actual date
			{
				actualDate = resp[resp.length - 1].date;
				var dummyURL = serverurl + "&date=" + resp[resp.length - 1].date;
				dummyURL = dummyURL + "&dataset=first";
				singleRequest.open("GET", dummyURL, true); 
				singleRequest.send();
			}
			else
			{
				if(data1==null) // Second: got first timestamp
				{
					data1 = resp;
					var dummyURL = serverurl + "&date=" + actualDate;
					dummyURL = dummyURL + "&dataset=last";
					singleRequest.open("GET", dummyURL, true); 
					singleRequest.send();
				}
				else // Third: got last timestamp and call callback
				{
					data2 = resp;
					callback(data1, data2);
				}
		}
	}
		singleRequest.open("GET", dummyURL, true); 
		singleRequest.send();		
	}
	
	//Emit signal to server to retrieve videos
	var videoRequest = createRequest(); 
	self.emitGetVideos = function(callback)
	{
		var dummyURL = url + "/drop?type=getPreviewLink&folderName=/";
		
		videoRequest.onreadystatechange = function() 
		{
			if (videoRequest.readyState != 4) 
				return; 
			if (document.domain && videoRequest.status != 200 && videoRequest.status != 304) 
				return;
			var resp = videoRequest.responseText;
			
			// Error Handling
			if(resp == null)
				return
			
			var res = resp.split(",");
			callback(false, res);
		}
		videoRequest.open("GET", dummyURL, true); 
		videoRequest.send();	
	}
	self.connect = function(){}
}

var SERVER_CONNECTOR;

if(USE_REST)
{
	SERVER_CONNECTOR = new ServerConnectorREST(SERVER_BASE_URL);
}
else
{
	SERVER_CONNECTOR = new ServerConnectorNODEJS(SERVER_BASE_URL);
}
