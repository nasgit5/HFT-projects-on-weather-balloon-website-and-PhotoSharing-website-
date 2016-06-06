/**
 * TimeScroller class
 */

 //Defines if timescroller is pinned to current timestamp
var TIME_PINNED_TO_LATEST = true;

function TimeScroller() 
{
	var self = this;

	//Defines if user is currently scrolling the bar
	var userScrolling = false;
	var initialized = false;
	
	var oldMinValue, oldMaxValue;
	
	var defaultStartDate = new Date(00, 00, 00, 00, 00, 00);
	//var defaultStartDate = new Date(0);
	var defaultEndDate = new Date(defaultStartDate);	
	defaultEndDate.setMinutes(defaultStartDate.getMinutes() + 1);
	
	//Init slider
    $("#time_slider").dateRangeSlider(
	{
		bounds: {min: defaultStartDate, max: defaultEndDate}, 
		formatter: function(value){
			
			var hour = value.getHours();
			var	minute = value.getMinutes();
			var seconds = value.getSeconds();
			
			var text = "" /*+ days + "." + month + "." + year + " "*/ + (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute) + ":" + (seconds < 10 ? "0" + seconds : seconds);
			
			if (value < $("#time_slider").dateRangeSlider("bounds").max) 
                return text;
			else 
				return "Latest: " + text;
		}
	});
	    
	//ActionListener on values changed
	$("#time_slider").bind("valuesChanging", function(e, data)
	{
		//save old bounds once when user starts to change them to reset them if new chosen timespan doesn't contain data
		if(userScrolling == false)
		{
			oldMinValue = data.values.min;
			oldMaxValue = data.values.max;
		}
		userScrolling = true;
    });
	
	//ActionListener on values changed manually by user
	$("#time_slider").bind("userValuesChanged", function(e, data)
	{
		userScrolling = false;
	
		//Pin TimeScroller to right side if its near. Makes it more comfortable for the user to pin
		var boundMax = $("#time_slider").dateRangeSlider("bounds").max;
		var valueMax = $("#time_slider").dateRangeSlider("values").max;
		var difference = new Date(boundMax - valueMax);
		
		if (difference.getSeconds() > 2)
			TIME_PINNED_TO_LATEST = false;
		else
			TIME_PINNED_TO_LATEST = true;	
		
		//---------- contact server to get data between chosen timestamps --------
		var start = $("#time_slider").dateRangeSlider("values").min;
		var end = $("#time_slider").dateRangeSlider("values").max;
		var diffSec = (end.getTime() - start.getTime()) / 1000.0;
		
		var startString = jsDateToSQLDateString(start);

		//build parameter string
		var params = '{\"format\":\"json\",\"timestamp\":\"' + startString + '\",\"seconds\":\"' + (diffSec + 1) + '"}';
		
		//Send data request to Server
		SERVER_CONNECTOR.emitViewChanged(params);
		
	});
	
	//Set max bounds of TimeScroller
	function setMaxBounds(max) 
	{
		$("#time_slider").dateRangeSlider("bounds", $("#time_slider").dateRangeSlider("bounds").min, max);
		
		if(TIME_PINNED_TO_LATEST == true)
			$("#time_slider").dateRangeSlider("max", max);
    }

	//Loads all data from the database when the server connection is established after Frontend opened
	function init() 
	{
		var params = '{\"format\":\"json\"}';
		var flightStartDates = SERVER_CONNECTOR.emitGetFlightDates(params, loadFormerData);
    }
	
	function loadFormerData(start, end)
	{
		if (start == undefined || start == null || start.length == 0 || jQuery.isEmptyObject(start[0])) 
		{
			console.log("No data in database");
			return;
		}
	
		var startTimestamp = sqlDateStringToJSDate(start[0].daterec);
		var endTimestamp = sqlDateStringToJSDate(end[0].daterec);
		var tempStartTimestamp = new Date(endTimestamp);

		var diffSecToLoad = 60;

		var loadFrequencyInMS = 400;
		var loadingComplete = false;
			
		console.log("Start loading former data");
		
		var backgroundTask = setInterval(function()
		{	
			if(tempStartTimestamp < startTimestamp)
			{
				if(loadingComplete == true)
				{
					console.log("Finished loading former data");
					clearInterval(backgroundTask);
					return;
				}
				else
				{
					loadingComplete = true;
				}
			}
			
			var dateString = jsDateToSQLDateString(tempStartTimestamp);
			var params = '{\"format\":\"json\",\"timestamp\":\"' + dateString + '\",\"seconds\":\"' + diffSecToLoad + '"}';
		
			SERVER_CONNECTOR.emitGetFormerData(params);
			
			endTimestamp = tempStartTimestamp;
			tempStartTimestamp = new Date(endTimestamp - diffSecToLoad * 1000);
		}
		, loadFrequencyInMS);
	}
	
	
	//SQL-date-string to javascript date
	function sqlDateStringToJSDate(dateString)
	{
		//incoming format like yyyy-mm-dd hh:mm:ss.ms
		var date = dateString.split(" ")[0].split("-");
		var hms = dateString.split(" ")[1].split(".")[0].split(":");
		var ms = dateString.split(" ")[1].split(".")[1];
		
		var newDate = "" + date[1] + " " + date[2]  + ", " + date[0]  + " " + hms[0]  + ":" + hms[1] + ":" + hms[2];
		var date = new Date(newDate);
		date.setMilliseconds(parseInt(ms));
		
		return date;
	}
	
	//javascript date to SQL-date-string
	function jsDateToSQLDateString(date)
	{
		var month = (date.getMonth() + 1);
		var day = date.getDate();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();
		var milliseconds = date.getMilliseconds();
		
		month = month < 10 ? '0' + month : month;
		day = day < 10 ? '0' + day : day;
		hours = hours < 10 ? '0' + hours : hours;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		seconds = seconds < 10 ? '0' + seconds : seconds;
	
		return ("" + date.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds + "." + milliseconds);
	}
	
	//Called by ServerConnector: Handle incoming current data
	function onCurrentData(dataset)
	{
		if(initialized == false)
		{
			var min = sqlDateStringToJSDate(dataset.daterec);
			min.setSeconds(min.getSeconds()-1);
			$("#time_slider").dateRangeSlider("bounds", min, sqlDateStringToJSDate(dataset.daterec));
			$("#time_slider").dateRangeSlider("min", sqlDateStringToJSDate(dataset.daterec));
			initialized = true;
		}			
		
		//just update bar if user not scrolling in the moment
		if(userScrolling == false)
			setMaxBounds(sqlDateStringToJSDate(dataset.daterec));
	}
	
	//Called by ServerConnector: Handle incoming former data
	function onFormerData(dataset)
	{
		if(dataset.length > 0)
		{
			var min = sqlDateStringToJSDate(dataset[0].daterec);
		
			if(initialized == false)
			{
				var max = sqlDateStringToJSDate(dataset[dataset.length - 1].daterec);
				
				$("#time_slider").dateRangeSlider("bounds", min, max);
				
				setMaxBounds(max);
				
				initialized = true;
			}			
			else
			{	
				$("#time_slider").dateRangeSlider("bounds", min, $("#time_slider").dateRangeSlider("bounds").max);
			}
			
			$("#time_slider").dateRangeSlider("min", min);
		}
	}
	
	//Called by ServerConnector: Handle incoming data by view changed
	function viewChanged(data)
	{
		if(data == undefined || data == null || data.length == 0 || jQuery.isEmptyObject(data[0]))
		{
			$("#time_slider").dateRangeSlider("min", oldMinValue);
			$("#time_slider").dateRangeSlider("max", oldMaxValue);
		}
		else
		{
			if(initialized == false)
			{
				if(data.length > 1)
				{
					var min = sqlDateStringToJSDate(data[0].daterec);
					var max = sqlDateStringToJSDate(data[data.length - 1].daterec);
				
					$("#time_slider").dateRangeSlider("bounds", min, max);
					$("#time_slider").dateRangeSlider("min", min);
					$("#time_slider").dateRangeSlider("max", max);
					
					initialized = true;
				}
			}
		}
	}
	
	//Called by ServerConnector: Handle server connection established
	function connectionEstablished()
	{
		init();
	}
	
	//Subscribe at ServerConnector to get data
	SERVER_CONNECTOR.subscribeOnCurrentData(onCurrentData);
	SERVER_CONNECTOR.subscribeOnFormerData(onFormerData);
	SERVER_CONNECTOR.subscribeOnViewChanged(viewChanged);
	SERVER_CONNECTOR.subscribeOnConnectionEstablished(connectionEstablished);
}

$(document).ready(function () 
{
	var timeScroller = new TimeScroller();
});
