/**
 * Map class
 */

var startPosLat = -1, startPosLon = -1;
var passedDistanceAbsolut = 0, passedDistance = 0;
var lastLat = -1, lastLon = -1, lastFormerData, lastTimestamp;
var balloonInitialized = false;

var map;
var deltaPos;

var lineLayer, line, lineStyle, lineFeature;
var circle, featureCircle, circleLayer, circleStyle, circleRadius = 30;
var balloonLayer, balloonStyle;
var animationTimeout, oldAnimationPosition, isAnimationRunning = false;


function Map(div_id, startLat, startLon)
{
	var self = this;
	var newPos;
	
	//Defines if the balloon is always centered on map
	var followBalloon = true;
		
	var vectors, balloon; 
	
	 //Projections
	var epsg4326 = new OpenLayers.Projection('EPSG:4326');
	var epsg900913 = new OpenLayers.Projection('EPSG:900913');
	
	//Called from serverConnector: New data is pushed into map
	function onCurrentData(data)
	{
		newPos = new OpenLayers.LonLat(data.lon, data.lat)
          .transform(
            epsg4326, 					// transform from WGS 1984
            map.getProjectionObject() 	// to Spherical Mercator Projection
          );
		
		if(balloonInitialized == false)
		{
			balloon.move(newPos);
			map.setCenter(newPos);
			balloonInitialized = true;
		}
		
		//if max value of Timebar is set to Latest to always show current data
		if(TIME_PINNED_TO_LATEST == true)
		{
			//Add new Point to Polygonline
			line.addPoint(new OpenLayers.Geometry.Point(data.lon, data.lat).transform(epsg4326, epsg900913));
			lineLayer.redraw();
			
			// Update inaccuracy of balloon position by changing circle radius
			// dhop = data. ... not yet implemented by server, frank says between 1.33 and 5.29
			//hdop = 1.33 + (Math.random() * 5);
			var radius = getRadius(data.precision);
			
			featureCircle.geometry.resize(radius/circleRadius , new OpenLayers.Geometry.Point(data.lon, data.lat).transform(epsg4326, epsg900913));
			circleRadius = radius;
			
			if(startPosLat == -1 && startPosLon == -1)
			{
				startPosLat = data.lat;
				startPosLon = data.lon;
			}
		
			if(lastLat != -1 && lastLon != -1)
			{
				//calculate current distances for telemetry
				passedDistanceAbsolut += getDistance(data.lat, data.lon, lastLat, lastLon);
				var duration = sqlDateStringToJSDate(data.daterec).getTime() - lastTimestamp.getTime();
				animateTo(new OpenLayers.LonLat(lastLon, lastLat).transform(epsg4326, map.getProjectionObject()) , newPos, duration);
			}
			passedDistance = getDistance(startPosLat, startPosLon, data.lat, data.lon);
			telemetryConsumer.updateDistanceData();
		}
		
		lastLat = data.lat;
		lastLon = data.lon;
		lastTimestamp = sqlDateStringToJSDate(data.daterec);
	}
	
	//Called from serverConnector: New data is pushed into map
	function onFormerData(dataset)
	{
		if(dataset.length > 0)
		{
			if(balloonInitialized == false)
			{
				var lastData = dataset[dataset.length - 1];
			
				var pos = new OpenLayers.LonLat(lastData.lon, lastData.lat)
				.transform(
					epsg4326, 					
					map.getProjectionObject() 
				);
			
				balloon.move(pos);
				featureCircle.move(pos);
				
				map.setCenter(new OpenLayers.LonLat(lastData.lon, lastData.lat).transform(epsg4326,	map.getProjectionObject()));
				
				lastLat = lastData.lat;
				lastLon = lastData.lon;
				lastTimestamp = sqlDateStringToJSDate(lastData.daterec);
				
				balloonInitialized = true;
			}
			
			//Add former Points to Polygonline
			if(lastFormerData != null)
			{
				passedDistanceAbsolut += getDistance(lastFormerData.lat, lastFormerData.lon, dataset[dataset.length - 1].lat, dataset[dataset.length - 1].lon);
			}
			
			for (var i = dataset.length - 1; i >= 0 ; i--) 
			{
				if(i < dataset.length - 1)
				{
					passedDistanceAbsolut += getDistance(dataset[i + 1].lat, dataset[i + 1].lon, dataset[i].lat, dataset[i].lon);
				}
				
				line.addPoint(new OpenLayers.Geometry.Point(dataset[i].lon, dataset[i].lat).transform(epsg4326, epsg900913), 0);
				lineLayer.redraw();
			}
			
			lastFormerData = dataset[0];
			if(lastLat != -1 && lastLon != -1)
			{
				passedDistance = getDistance(dataset[0].lat, dataset[0].lon, lastLat, lastLon);
			}
			
			telemetryConsumer.updateDistanceData();
		}
	}
	
	//Called from serverConnector: New data between chosen timestamps is pushed into map
	function viewChanged(data)
	{
	
		if(data == undefined || data == null || data.length == 0 || jQuery.isEmptyObject(data[0]))
		{
			return;
		}
		
		var endLat = data[data.length-1].lat;
		var endLng = data[data.length-1].lon;
	
		var pos = new OpenLayers.LonLat(endLng, endLat)
          .transform(
            epsg4326, 					
            map.getProjectionObject() 
		);
	
		if(TIME_PINNED_TO_LATEST == false)
		{
			clearTimeout(animationTimeout);
		}
	
		balloon.move(pos);
		featureCircle.move(pos);
		map.panTo(new OpenLayers.LonLat(endLng, endLat).transform(epsg4326,	map.getProjectionObject()));
		
		//clear line
		lineLayer.removeFeatures(lineFeature);
		line = new OpenLayers.Geometry.LineString();
		lineFeature = new OpenLayers.Feature.Vector(line, null, lineStyle);
		lineLayer.addFeatures([lineFeature]);
		
		var latlng;
		
		if(startPosLat == -1 && startPosLon == -1)
		{
			startPosLat = data[0].lat;
			startPosLon = data[0].lon;	
		}
	
		passedDistance = getDistance(startPosLat, startPosLon, endLat, endLng);
		passedDistanceAbsolut = 0;
		
		//Push all points into Polygonline
		for(var i = 0; i < data.length; i++)
		{
			if(i > 0)
			{
				passedDistanceAbsolut += getDistance(data[i - 1].lat, data[i - 1].lon, data[i].lat, data[i].lon);
			}
			
			latlng = new OpenLayers.Geometry.Point(data[i].lon, data[i].lat).transform(epsg4326, epsg900913);
			line.addPoint(latlng);
		}
	
		lineLayer.redraw();
		telemetryConsumer.updateDistanceData();
		
		// Update inaccuracy of balloon position by changing circle radius
		// dhop = data. ... not yet implemented by server, frank says between 1.33 and 5.29
		//hdop = 1.33 + (Math.random() * 5);
		var radius = getRadius(data[data.length-1].precision);
			
		featureCircle.geometry.resize(radius/circleRadius , new OpenLayers.Geometry.Point(endLng, endLat).transform(epsg4326, epsg900913));
		circleRadius = radius;
		
		lastLat = endLat;
		lastLon = endLng;	
	}

	
	//Interpolation of Balloon position between two coordinates
	function animateTo(oldPosition, newPosition, duration_ms) 
	{
		//if previous animation not completed yet, complete it
		if(isAnimationRunning)
		{
			//break Timeout-loop
			clearTimeout(animationTimeout);
			
			//if map is pinned to balloon, set map to end position of current path
			if(followBalloon == true)
			{
				map.panTo(newPosition);
			}
			
			//update balloon and circle to not move "under" the map
			circleLayer.redraw();
			balloonLayer.redraw();
			
			//set balloon and precision circle to end position of current path
			balloon.move(oldAnimationPosition);
			featureCircle.move(oldAnimationPosition);
			 
			isAnimationRunning = false;
		}
		
		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

		// save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
		var newPosition_lat = newPosition.lat;
		var newPosition_lng = newPosition.lon;
		
		// crossing the 180° meridian and going the long way around the earth?
		if (Math.abs(newPosition_lng - oldPosition.lon) > 180) {
			if (newPosition_lng > oldPosition.lon ) {
				newPosition_lng -= 360;
			} else {
				newPosition_lng += 360;
			}
		}

		var animateStep = function (startTime) 
		{
			var elapsedTime = (new Date()).getTime() - startTime;
			var durationRate = elapsedTime / duration_ms; // 0 - 1
			var durationRateDec = durationRate;

			//if end position not reached yet
			if (durationRate < 1) 
			{
				//calculate current delta position
				deltaPos = new OpenLayers.LonLat
				(
					oldPosition.lon + (newPosition_lng - oldPosition.lon) * durationRateDec,
					oldPosition.lat + (newPosition_lat - oldPosition.lat) * durationRateDec
					
				)/*.transform(epsg4326, map.getProjectionObject())*/;

				//move balloon and precision circle to delta position
				balloon.move(deltaPos);
				featureCircle.move(deltaPos);

				//start "background" loop which calls animationStep every 17 ms
				animationTimeout = setTimeout(function () 
				{
					animateStep(startTime)
				}, 17);
			} 
			else 
			{
				//finish balloon movement
			
				balloon.move(newPosition/*, balloonStyle*/);
				featureCircle.move(newPosition/*, circleStyle*/);
				
				if(followBalloon == true)
				{
					map.panTo(newPosition);
				}
				
				//update balloon and circle to not move "under" the map
				circleLayer.redraw();
				balloonLayer.redraw();
				
				isAnimationRunning = false;
			}
		}
		clearTimeout(animationTimeout);
		oldAnimationPosition = newPosition;
		animateStep((new Date()).getTime());
		isAnimationRunning = true;
	}	
	
	// Initialization
	
	 map = new OpenLayers.Map(div_id, {
        //projection: 'EPSG:4326',
        layers: [
            new OpenLayers.Layer.Google(
                "Google Hybrid",
                {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 18}
            ),
            new OpenLayers.Layer.Google(
                "Google Satellite",
                {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 18}
            ),
			new OpenLayers.Layer.Google(
                "Google Physical",
                {type: google.maps.MapTypeId.TERRAIN}
            ),
            new OpenLayers.Layer.Google(
                "Google Streets", // the default
                {numZoomLevels: 20}
            )
        ],
        zoom: 15
    });
    map.addControl(new OpenLayers.Control.LayerSwitcher());
	map.setCenter(new OpenLayers.LonLat(startLon, startLat).transform(epsg4326,	map.getProjectionObject()), 15);
	
	balloonStyle = new OpenLayers.Style(
	{ 
		externalGraphic: 'IMG/marker2.png', 
		graphicWidth: 32, 
		graphicHeight: 37,
		graphicYOffset: -36
	});
	
	balloon = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(startLon, startLat).transform(epsg4326, map.getProjectionObject())/*, null, balloonStyle.defaultStyle*/);
	
	balloonLayer = new OpenLayers.Layer.Vector("Show Balloon", {/*renderers: ["Canvas", "SVG", "VML"],*/ styleMap: balloonStyle});
	//balloonLayer.styleMap = balloonStyle;
	
	map.addLayer(balloonLayer);
	balloonLayer.addFeatures([balloon]);
	
	//Create lineString for balloon path on map
	lineLayer = new OpenLayers.Layer.Vector("Show Balloon Path"); 
	map.addLayer(lineLayer);    
	
	lineStyle = 
	{ 
		strokeColor: '#FF0000', 
		strokeOpacity: 1.0,
		strokeWidth: 3
	};

	line = new OpenLayers.Geometry.LineString();
	lineFeature = new OpenLayers.Feature.Vector(line, null, lineStyle);
	lineLayer.addFeatures([lineFeature]);
	
	var point = new OpenLayers.Geometry.Point(startLon, startLat).transform(epsg4326, map.getProjectionObject());
	
	//Create Circle around balloon to display data accuracy
	circle = OpenLayers.Geometry.Polygon.createRegularPolygon
	(
		point,
		circleRadius,
		40,
		0
	);
	
	circleStyle = 
	{ 
		fillColor : "#ff2300",
		fillOpacity : 0.5,
		//strokeColor : "#ff2300"
		strokeWidth: 0
	};
	
	featureCircle = new OpenLayers.Feature.Vector(circle, null, circleStyle);
	circleLayer = new OpenLayers.Layer.Vector("Show Accuracy");
	map.addLayer(circleLayer);
	circleLayer.addFeatures([featureCircle]);
	
	//Bind listeners
	var dragcontrol = new OpenLayers.Control.DragPan({'map': map, 'panMapDone': dragNotice});
	map.addControl(dragcontrol);
	dragcontrol.activate();
	
	var selectFeature = new OpenLayers.Control.SelectFeature(
		balloonLayer,
		{
			onSelect: clickNotice,
			autoActivate: true
		}
	);
	map.addControl(selectFeature);  
	
	function clickNotice() 
	{
        followBalloon = true;
		selectFeature.unselectAll();
		map.panTo(deltaPos);
    }
	
	function dragNotice() 
	{
		lineLayer.redraw();
		balloonLayer.redraw();
        followBalloon = false;
    }
	

	//Subscribe at ServerConnector to get data
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

// 95% confidence circle radius from HDOP and CEP
function getRadius(HDOP) 
{
	return HDOP * CEP; 
}

function deg2rad(deg) 
{
  return deg * (Math.PI/180)
}

$(document).ready(function()
{
	var mapObj = new Map('map_canvas', 48.780698, 9.173992);
});
