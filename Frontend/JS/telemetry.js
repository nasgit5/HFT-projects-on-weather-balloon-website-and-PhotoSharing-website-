/**
 * Telemetry class
 */

function TelemetryConsumer()
{
	var self=this;
	var initialized = false;
	
	//Handle incoming current data
	function onCurrentData(data)
	{
		if(TIME_PINNED_TO_LATEST == true)
		{
			setValues(data);
			initialized = true;
		}
	}
	
	//Handle incoming former data
	function onFormerData(dataset)
	{
		if(TIME_PINNED_TO_LATEST == true && initialized == false)
		{
			setValues(dataset[dataset.length - 1]);
			initialized = true;
		}
	}
	
	//Handle view changed by user
	function viewChanged(data)
	{
		if(data == undefined || data == null || data.length == 0 || jQuery.isEmptyObject(data[0]))
		{
			console.log("Error in telemetry.viewChanged(): data is undefined or not valid");
			return;
		}
		lastDataset = data[data.length-1];
		setValues(lastDataset);
	}
	
	// Update all telemetry entries
	function setValues(data)
	{
		$('#last_update').html(data.daterec);
		$('#altitude_table').html(Number(data.altitude).toFixed(2));
		$('#latitude_table').html(Number(data.lat).toFixed(4));
		$('#longitude_table').html(Number(data.lon).toFixed(4));
		$('#battery_table').html(Number(data.voltage).toFixed(2));
		$('#pressure_table').html(Number(data.pres).toFixed(3));
		$('#humidity_table').html(Number(data.humidity).toFixed(3));
		$('#temperature_table').html(Number(data.otemp).toFixed(3));
		$('#innertemperature_table').html(Number(data.itemp).toFixed(3));
		$('#altitudeBaro_table').html(Number(data.bAltitude).toFixed(3));
		$('#hVelocity_table').html(Number(data.hVelocity).toFixed(3));
		$('#vVelocity_table').html(Number(data.vVelocity).toFixed(3));
		$('#dVelocity_table').html(Number(data.dVelocity).toFixed(3));
	}
	
	// Update passed distance separately
	self.updateDistanceData = function()
	{
		$('#distance_table').html(passedDistance.toFixed(2));
		$('#distanceAbs_table').html(passedDistanceAbsolut.toFixed(2));
	}
	
	//Subscribe at ServerConnector to get data
	SERVER_CONNECTOR.subscribeOnCurrentData(onCurrentData);
	SERVER_CONNECTOR.subscribeOnFormerData(onFormerData);
	SERVER_CONNECTOR.subscribeOnViewChanged(viewChanged);
}

var telemetryConsumer = new TelemetryConsumer();

