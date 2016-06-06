/**
 * Map class
 */
 

var startPosLat = -1;
var startPosLon = -1;
var passedDistanceAbsolut = 0;
var passedDistance = 0;
var lastLat = -1;
var lastLon = -1;
var balloon;
var balloonInitialized = false;


function Map(div_id,startLat,startLon)
{
	var self = this;
	var countInstances = 0;
	var newPos;
	
	//Defines if the balloon is always centered on map
	var followBalloon = true;
		
	var mapOptions = {
		zoom: 17,
		center: new google.maps.LatLng(startLat,startLon),
		mapTypeId: google.maps.MapTypeId.HYBRID
	};
	
	//Called from serverConnector: New data is pushed into map
	function onCurrentData(data)
	{
		newPos = new google.maps.LatLng(data.lat, data.lon);
		
		if(balloonInitialized == false)
		{
			balloon.setPosition(newPos);
			//balloon.animateTo(newPos); 
			//map.panTo(newPos);
			map.setCenter(newPos);
			balloonInitialized = true;
		}
		
		//if max value of Timebar is set to Latest to always show current data
		if(TIME_PINNED_TO_LATEST == true)
		{
			balloon.setPosition(newPos);
			//balloon.animateTo(newPos); 
						
			if(followBalloon == true)
			{
				//Center balloon marker on map
				//map.panTo(newPos);
				map.setCenter(newPos);
			}
			
			//Add new Point to Polygonline
			flightPath.getPath().push(newPos);
			
			// Update inaccuracy of balloon position by changing circle radius
			// dhop = data. ... not yet implemented by server, frank says between 1.33 and 5.29
			dhop = 1.33 + (Math.random() * 5);
			circle.radius = getRadius(dhop);
			
			if(startPosLat==-1 && startPosLon == -1)
			{
				startPosLat = data.lat;
				startPosLon = data.lon;	
			}
		
			if(lastLat != -1 && lastLon != -1)
			{
				passedDistanceAbsolut += getDistance(data.lat, data.lon, lastLat, lastLon);
			}
		
			passedDistance = getDistance(startPosLat, startPosLon, data.lat, data.lon);
			
			lastLat = data.lat;
			lastLon = data.lon;	
		}
		
		/*countInstances++;
		if(countInstances>10)
		{
			balloon.setMap(null);
			balloon = new google.maps.Marker({
			//position: new google.maps.LatLng(startLat, startLon),
			map: map,
			title : 'Click to follow the balloon',
			icon: "IMG/marker2.png"
			});
		    balloon.set('optimized', false);
		    balloon.setPosition(newPos);
		    
		    google.maps.event.addListener(balloon, 'click', function() 
			{
				followBalloon = true;
			});
		    
		    flightPath = new google.maps.Polyline({
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 3
			});
			flightPath.setMap(map);
		    
		    countInstances = 0;
		}*/
	}
	
	//Called from serverConnector: New data is pushed into map
	function onFormerData(dataset)
	{
		if(dataset.length > 0)
		{
			if(balloonInitialized == false)
			{
				balloon.setPosition(new google.maps.LatLng(dataset[dataset.length - 1].lat, dataset[dataset.length - 1].lon));
				map.panTo(new google.maps.LatLng(dataset[dataset.length - 1].lat, dataset[dataset.length - 1].lon));
				
				balloonInitialized = true;
			}
		
			//Add former Points to Polygonline
		
			for (var i = dataset.length - 1; i > 0 ; i--) 
			{
				flightPath.getPath().insertAt(0, new google.maps.LatLng(dataset[i].lat, dataset[i].lon));
			}
		}
	}
	
	//Called from serverConnector: New data between chosen timestamps is pushed into map
	function viewChanged(data)
	{
		var endLat = data[data.length-1].lat;
		var endLng = data[data.length-1].lon;
	
		balloon.setPosition(new google.maps.LatLng(endLat, endLng));
		map.panTo(balloon.getPosition());
		
		//clear Polygonline
		flightPath.getPath().clear();
		
		var latlng;
		
		//Push all points into Polygonline
		for(var i = 0; i < data.length; i++)
		{
			latlng = new google.maps.LatLng(data[i].lat, data[i].lon);
			flightPath.getPath().push(latlng);
		}
		
		// Update inaccuracy of balloon position by changing circle radius
		// dhop = data. ... not yet implemented by server, frank says between 1.33 and 5.29
		dhop = 1.33 + (Math.random() * 5);
		circle.radius = getRadius(dhop);
		
		if(startPosLat==-1 && startPosLon == -1)
		{
			startPosLat = endLat;
			startPosLon = endLng;	
		}
	
		if(lastLat != -1 && lastLon != -1)
		{
			passedDistanceAbsolut += getDistance(endLat, endLng, lastLat, lastLon);
		}
	
		passedDistance = getDistance(startPosLat, startPosLon, endLat, endLng);
		
		lastLat = endLat;
		lastLon = endLng;	
	}
	
	
	/**
	 * Initialization
	 */
	 
	//Create Map
	map = new google.maps.Map(document.getElementById(div_id), mapOptions);
	
	//Create balloon marker on map
	balloon = new google.maps.Marker({
			//position: new google.maps.LatLng(startLat, startLon),
			map: map,
			title : 'Click to follow the balloon',
			icon: "IMG/marker2.png"
		});
	balloon.set('optimized', false);
	
	//Create Polygonline for balloon path on map
	flightPath = new google.maps.Polyline({
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 3
	});
	flightPath.setMap(map);
	
	//Create Circle around balloon to display data accuracy
	circle = new google.maps.Circle(
	{
		map: map,
		radius: 50,    // metres
		fillColor: '#FFaaaa',
		strokeWeight: 1,
		strokeColor: '#AAAAAA'
	});
	circle.bindTo('center', balloon, 'position');
	
	//Bind MouseListener to balloon marker
	google.maps.event.addListener(map, 'dragend', function() 
	{ 
		followBalloon = false;
	});

	google.maps.event.addListener(balloon, 'click', function() 
	{
		followBalloon = true;
	});

	//Subscribe at ServerCOnnector to get data
	SERVER_CONNECTOR.subscribeOnCurrentData(onCurrentData);
	SERVER_CONNECTOR.subscribeOnFormerData(onFormerData);
	SERVER_CONNECTOR.subscribeOnViewChanged(viewChanged);
}

//Calculates Distance between two GPS-points
function getDistance(lat1, lon1, lat2, lon2) 
{
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
	
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	
	return d; 
}

//Calculates 95% confidence circle radius from DHOP and CET
function getRadius(DHOP) 
{
	return DHOP * CET; 
}

function deg2rad(deg) 
{
  return deg * (Math.PI/180)
}

$(document).ready(function()
{
	var map = new Map('map_canvas','48.780698', '9.173992');
});



