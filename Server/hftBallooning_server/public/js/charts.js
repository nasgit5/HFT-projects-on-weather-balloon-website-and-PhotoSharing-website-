/**
 * Chart class
 */

function BalloonChart(divID, title, titleX, titleY, chartColor, chartType) 
{
	var self = this;
	var div_id = divID;
	var chart = null;
	var options;
	
	var Title = title;
	var TitleX = titleX;
	var TitleY = titleY;
			
	var data = new Array();
	data.push([titleX,titleY]);
	
	var scatterChartInitialized = false;
	var scatterData = 0;
	
	//set chart options
	if(chartType == 'LineChart')
	{
		options = {
				title: title,
				curveType: "function",
				colors: chartColor, 
				backgroundColor: { fill:'transparent' },
				width:"100%",
				height:"100%",
				vAxes: {
					0: {logScale: false},
					1: {logScale: false},
				},
				series:{
					0:{targetAxisIndex:0},
					1:{targetAxisIndex:1},
					2:{targetAxisIndex:2}
				}
			};
	}
	if(chartType == 'ScatterChart')
	{
		options = {
				title: title,
				width: "100%",
				'colors': ['#960909'],
				backgroundColor: { fill:'transparent' },
				height:"100%",
				'hAxis': 
						{
							'gridlines': {'color': 'none'},
							'textPosition': 'none'
						},
				'vAxis': 
						{
							'gridlines': {'color': 'none'},
							'title': 'none',
							'titleTextStyle': { 'color': 'none'},
							'textStyle': { 'color': 'none' },
							'minValue': '0',
							'maxValue': '47000',
							'textPosition': 'none',
							'scaleType': 'allmaximized',
							'viewWindowMode':'explicit',
							'viewWindow':
							{
								'max':'47000',
								'min':'0'
							}
						},
										
						'legend': 'none',
						'titleTextStyle': { 'color': 'none' }
		};
	}
	
	//Pushes a new row of data to the chart
	self.pushDataRow = function(timecode, value)
	{
		if(chartType == 'LineChart')
		{
			data.push([timecode ,value]);
		}
		else 
		{
			scatterChartInitialized = true;
			scatterData = value;
		} 
	}
	
	//Inserts a new row of data to the chart
	self.insertDataRowAtBeginning = function(timecode, value)
	{
		if(chartType == 'LineChart')
		{
			data.splice(1, 0, [timecode ,value]);
		}
		
		if(scatterChartInitialized == false)
		{
			scatterData = value;
			scatterChartInitialized = true;
		}
	}
	
	//clear all data of the chart
	self.clearDataRows = function()
	{
		data = new Array();
		data.push([TitleX, TitleY]);
	}
	
	// Initialization
	self.init = function()
	{
		var chart_container = document.getElementById(div_id);
	
		if(chartType == 'LineChart')
		{
			chart = new google.visualization.LineChart(chart_container);
		}
		
		if(chartType == 'ScatterChart')
		{
			chart = new google.visualization.ScatterChart(chart_container);
		}
	}
	
	// Redraw Chart
	self.draw = function()
	{
		if(chartType == 'ScatterChart')
		{
			var dataAltitude = google.visualization.arrayToDataTable([
                    [' ', 'Height'],
                    [0, scatterData]
                ]);
                chart.draw(dataAltitude, options);
		}
		else 
		{
			//put all data into a dataTable
			var google_table = google.visualization.arrayToDataTable(data);
			//draw the chart with given dataTable and defined options
			chart.draw(google_table, options);
		}
	}
	
	//Include Google Chart API 1.1 which is the next version to be released. Version 1.1 has some performance improvements right now
	google.load("visualization", "1.1", {packages:["corechart"]});
	google.setOnLoadCallback(self.init);
}

//Creation of all BalloonChart objects
var chart_temp = new BalloonChart('chart_temp', 'Temperature', 'Time', '°C', ['#769dbb'], 'LineChart');
var chart_pressure = new BalloonChart('chart_pressure', 'Pressure', 'Time', 'hPa', ['#bb9476'], 'LineChart');
var chart_humidity = new BalloonChart('chart_humidity', 'Humidity', 'Time', '%' , ['#bb769d'], 'LineChart');
var chart_altitude = new BalloonChart('chart_altitude', 'Altitude', 'Time', 'km', ['#ffffff'], 'ScatterChart');

//Subscribe at Server to get data
SERVER_CONNECTOR.subscribeOnCurrentData(onCurrentData);
SERVER_CONNECTOR.subscribeOnFormerData(onFormerData);
SERVER_CONNECTOR.subscribeOnViewChanged(viewChanged);

//Called by ServerConnector. New dataset gets parsed and the single values pushed to the belonging chart
function onCurrentData(dataset) 
{
	if(TIME_PINNED_TO_LATEST == true)
	{
		addDataToCharts("push", dataset);
		
		redrawCharts();
	}
}	

//Called by ServerConnector. New dataset gets parsed and the single values pushed to the belonging chart
function onFormerData(dataset)
 {
	if(dataset != undefined && dataset != null && dataset.length > 0 && !jQuery.isEmptyObject(dataset[0]))
	{
		for(var i = dataset.length - 1; i >= 0; i--)
		{
			addDataToCharts("insert", dataset[i]);
		}
		redrawCharts();
	}
}	

//Called by ServerConnector. Fills charts with new datasets between chosen timestamps
function viewChanged(dataset)
{
	if(dataset == undefined || dataset == null || dataset.length == 0 || jQuery.isEmptyObject(dataset[0]))
	{
		return;
	}
		
	//clear all charts
	chart_temp.clearDataRows();
	chart_pressure.clearDataRows();
	chart_humidity.clearDataRows();

	for (var i = 0; i < dataset.length; i++) 
	{
		addDataToCharts("push", dataset[i]);
	}
	
	redrawCharts();
}


function addDataToCharts(strategy, dataset)
{
	if(jQuery.isEmptyObject(dataset) == false)
	{
		
		var date = sqlDateStringToJSDate(dataset.daterec);
			
		var hour = date.getHours();
		var	minute = date.getMinutes();
		var seconds = date.getSeconds();
				
		var stringTime = "" + (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute) + ":" + (seconds < 10 ? "0" + seconds : seconds);

		if(strategy == "push")
		{
			chart_temp.pushDataRow(stringTime, parseFloat(dataset.otemp));
			chart_pressure.pushDataRow(stringTime, parseFloat(dataset.pres));
			chart_humidity.pushDataRow(stringTime, parseFloat(dataset.humidity));
			chart_altitude.pushDataRow(stringTime, parseFloat(dataset.altitude));
		}
		else if(strategy == "insert")
		{
			chart_temp.insertDataRowAtBeginning(stringTime, parseFloat(dataset.otemp));
			chart_pressure.insertDataRowAtBeginning(stringTime, parseFloat(dataset.pres));
			chart_humidity.insertDataRowAtBeginning(stringTime, parseFloat(dataset.humidity));
			chart_altitude.insertDataRowAtBeginning(stringTime, parseFloat(dataset.altitude));
		}
	}
	else
	{
		console.log("addDataToCharts called with empty dataset");
	}
}

function redrawCharts()
{
	chart_temp.draw();
	chart_pressure.draw();
	chart_humidity.draw();
	chart_altitude.draw();
}


//Parse SQL-date to javascript date
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

