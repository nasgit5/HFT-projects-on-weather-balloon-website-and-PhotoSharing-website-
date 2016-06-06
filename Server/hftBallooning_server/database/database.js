/**
This is an implementation of a Web Application Server for the Master Course Software Technology.
@author: Dan Follwarczny
**/

//access to launchConfig
var launchConfig = require("./launchConfig.js");

//access variable for a file system
var fs = require("fs");

//access variable for the database file
var file = "serverDB.db";

//boolean variable to check if the database file is available
var exists = fs.existsSync(file);

//access variable for the sqlite3 module with extended debug output
var sqlite3 = require("sqlite3").verbose();

//access variable for the database
var db = new sqlite3.Database(file);

/** Function insertJSON
This function will check if a databse is available.
If not it will create one.
This Function will then calculate additional values from the received data and insert the received and calculated data into the database.
It will then emit the extended dataset as 'jsonData' event.
Finally it responds 'true'
@param res: the http response object.
@param data: the extracted data as JSON object.
@param io: The Websocket socket.io variable.
**/
exports.insertJSON = function (res, data, io) {
	db.serialize(function() {
		if(!exists) {
			db.run("CREATE TABLE IF NOT EXISTS dataset (daterec DATETIME,voltage FLOAT,humidity FLOAT,itemp FLOAT, otemp FLOAT, lat FLOAT, lon FLOAT, pres FLOAT, altitude FLOAT, src TEXT, hVelocity FLOAT, vVelocity FLOAT, dVelocity FLOAT, precision FLOAT, bAltitude FLOAT,  PRIMARY KEY(daterec,src))");
		};
	  	try {
			var stmt = "SELECT * FROM dataset WHERE daterec < \"" + data.daterec + "\" ORDER BY daterec DESC LIMIT 1";
			var barAlt = require('./barometricAlt');
			barAlt.calibrate(launchConfig.launchPressureGround, launchConfig.launchAltitude);
			data.bAltitude = barAlt.calcAltitudeWithLapseRate(data.pres);
			db.get(stmt, function (err, row) {
				if (typeof(row) == 'undefined') {
					var insStmt = db.prepare("INSERT INTO dataset (daterec,voltage,humidity,itemp,otemp,lat,lon,pres,altitude,src,precision,bAltitude) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
					insStmt.run(data.daterec,data.voltage,data.humidity,data.itemp,data.otemp,data.lat,data.lon,data.pres,data.altitude,data.src,data.precision,data.bAltitude);
					insStmt.finalize();
					res.send('true')
				} else {
					var secStmt = "SELECT strftime('%s','" + data.daterec + "') - strftime('%s','" + row.daterec + "') AS seconds"
					db.get(secStmt, function (err, resultSet) {
						var insStmt = db.prepare("INSERT INTO dataset (daterec,voltage,humidity,itemp,otemp,lat,lon,pres,altitude,src,hVelocity,vVelocity,dVelocity,precision,bAltitude) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
						data.hVelocity = speed(hDistance(data.lat, data.lon, row.lat, row.lon), resultSet.seconds);
						data.vVelocity = speed((data.altitude - row.altitude), resultSet.seconds);
						data.dVelocity = speed(dDistance(data.lat, data.lon, data.altitude, row.lat, row.lon, row.altitude), resultSet.seconds);

						insStmt.run(data.daterec,data.voltage,data.humidity,data.itemp,data.otemp,data.lat,data.lon,data.pres,data.altitude,data.src,data.hVelocity,data.vVelocity,data.dVelocity,data.precision,data.bAltitude);
						insStmt.finalize();
						res.send('true');
						io.sockets.emit('jsonData', createJSONDataset(new Array(data)));
					});
				}
			});

		} catch (err) {
			res.send('false')
		}
	});
}

//REST API functions
/** Function sendJSON (REST API)
This function will retrive one dataset with the given timestamp and optionally a specific source from the database.
It will then return return the the dataset if avaiable as JSON array, otherwise it will return an empty JSON array. 
The timestamp value is mandatory.
The src variable is optional.
@param res: the http response object.
@param timestamp: timestamp in format (YYYY-MM-DD HH:MM:SS).
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.sendJSON = function (res, timestamp, source, src) {
	db.serialize(function() {
		var stmt = "SELECT * FROM dataset WHERE daterec LIKE \"" + timestamp + "\"";
		if (source)
			var stmt = "SELECT * FROM dataset WHERE daterec LIKE \"" + timestamp + "\" AND src LIKE \"" + src + "\"";
		db.get(stmt, function (err, row) {
			if (typeof(row) == 'undefined') {
				res.send('[{}]');
			} else {
				res.send(createJSONDataset(new Array(row)));
			}
		});
	});
}

/** Function sendXML (REST API)
This function will retrive one dataset with the given timestamp and optionally a specific source from the database.
It will then return the the dataset if avaiable as XML file, otherwise it will return an empty XML file. 
The timestamp value is mandatory.
The src variable is optional.
@param res: the http response object.
@param timestamp: timestamp in format (YYYY-MM-DD HH:MM:SS) .
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.sendXML = function (res, timestamp, source, src) {
	db.serialize(function() {
		var stmt = "SELECT * FROM dataset WHERE daterec LIKE \"" + timestamp + "\"";
		if (source)
			var stmt = "SELECT * FROM dataset WHERE daterec LIKE \"" + timestamp + "\" AND src LIKE \"" + src + "\"";
		db.get(stmt, function (err, row) {
			res.send(createXMLDataset(new Array(row)));
		});
	});	
}

/** Function sendInterval (REST API)
This function will retrive datasets between two timestamps and optionally a specific source from the database.
It will then return the the datasets if avaiable as XML file or JSON array, otherwise it will return an empty XML file or empty JSON array, depending on the boolean xml variable.
The second timestamp is calculated from the given timestamp into the future.
The timestamp value is mandatory.
The src variable is optional.
@param xml: boolean if return format schould be XML or JSON.
@param res: the http response object.
@param timestamp: timestamp in format (YYYY-MM-DD HH:MM:SS).
@param seconds: integer seconds to determine second timestamp.
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.sendInterval = function (xml, res, timestamp, seconds, source, src) {
	db.serialize(function() {
		var stmt = "SELECT * FROM dataset WHERE daterec BETWEEN  datetime\(\"" + timestamp + "\"\) AND datetime\(\"" + timestamp + "\", +\'" + seconds + " seconds\'" + "\)";
		if (source)
			var stmt = "SELECT * FROM dataset WHERE src LIKE \"" + src + "\" AND daterec BETWEEN  datetime\(\"" + timestamp + "\"\) AND datetime\(\"" + timestamp + "\", +\'" + seconds + " seconds\'" + "\)";
		db.all(stmt, function (err, rows) {
			if (xml)
				res.send(createXMLDataset(rows));
			else
				res.send(createJSONDataset(rows));
		});
	});
}

/** Function sendFLDataset (REST API)
This function will select the first or the last dataset of an specific flight day and optionally a specific source from the database.
It will then return the the dataset if avaiable as XML file or JSON array, otherwise it will return an empty XML file or empty JSON array, depending on the boolean xml variable.
The timestamp value is mandatory.
The src variable is optional.
@param xml: boolean if return format schould be XML or JSON.
@param res: the http response object.
@param smallTimestamp: timestamp in format (YYYY-MM-DD).
@param last: boolean if last dataset schould be returned otherwise first will be returned.
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.sendFLDataset = function (xml, res, smallTimestamp, last, source, src) {
	db.serialize(function() {
		if (source) {
			var stmt = "SELECT *,date(daterec) as dateOnly FROM dataset WHERE dateOnly LIKE \"" + smallTimestamp + "\" AND src LIKE \"" + src + "\" ORDER BY daterec ASC LIMIT 1";
			if (last)
				var stmt = "SELECT *,date(daterec) as dateOnly FROM dataset WHERE dateOnly LIKE \"" + smallTimestamp + "\" AND src LIKE \"" + src + "\"  ORDER BY daterec DESC LIMIT 1";
		} else {
			var stmt = "SELECT *,date(daterec) as dateOnly FROM dataset WHERE dateOnly LIKE \"" + smallTimestamp + "\" ORDER BY daterec ASC LIMIT 1";
			if (last)
				var stmt = "SELECT *,date(daterec) as dateOnly FROM dataset WHERE dateOnly LIKE \"" + smallTimestamp + "\" ORDER BY daterec DESC LIMIT 1";
		}
		db.all(stmt, function (err, rows) {
			if (xml)
				res.send(createXMLDataset(rows));
			else
				res.send(createJSONDataset(rows));
		});
	});
}

/** Function sendNextDataset (REST API)
This function will select the next dataset in timeline from the given timestamp and optionally a specific source from the database.
It will then return the the dataset if avaiable as XML file or JSON array, otherwise it will return an empty XML file or empty JSON array, depending on the boolean xml variable.
The timestamp value is mandatory.
The src variable is optional.
@param xml: boolean if return format schould be XML or JSON.
@param res: the http response object.
@param timestamp: timestamp in format (YYYY-MM-DD HH:MM:SS).
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.sendNextDataset = function (xml, res, timestamp, source, src) {
	db.serialize(function() {
		var stmt = "SELECT * FROM dataset WHERE daterec > \"" + timestamp + "\" ORDER BY daterec ASC LIMIT 1";
		if (source)
			var stmt = "SELECT * FROM dataset WHERE daterec > \"" + timestamp + "\" AND src LIKE \"" + src + "\" ORDER BY daterec ASC LIMIT 1";
		db.all(stmt, function (err, rows) {
			if (xml)
				res.send(createXMLDataset(rows));
			else
				res.send(createJSONDataset(rows));
		});
	});
}

/** Function sendFlightDatesJSON (REST API)
This function will select all flight days in format (YYYY-MM-DD) from the database and optionally filter them by a specific source.
It will then return the the flight days if avaiable as XML file, otherwise it will return an empty XML file.
The timestamp value is mandatory.
The src variable is optional.
@param res: the http response object.

**/
exports.sendFlightDatesJSON = function (res) {
	db.serialize(function() {
		var stmt = "SELECT date(daterec) as dateOnly FROM dataset GROUP BY dateOnly";
		db.all(stmt, function (err, rows) {
			var result = '[';
			if(typeof(rows) == 'undefined') {
				res.send(result.concat('{}]'));
				return;
			}
			if (rows.length < 1) {
				res.send(result.concat('{}]'));
				return;
			}
			for (i= 0; i < rows.length; i++) {
				var row = rows[i];
				if (typeof(row) == 'undefined') {
					continue;
				} else {
					result = result.concat('{ \"date\" : \"');
					result = result.concat(row.dateOnly);
					result = result.concat('\"}');
					if(i < (rows.length - 1))
						result = result.concat(',');
				}
			}
			result = result.concat(']')
			res.send(result);
		});
	});
}

/** Function sendFlightDatesJSON (REST API)
This function will select all flight days in format (YYYY-MM-DD) from the database and optionally filter them by a specific source.
It will then return the the flight days if avaiable as JSON array, otherwise it will return an empty JSON array.
The timestamp value is mandatory.
The src variable is optional.
@param res: the http response object.
**/
exports.sendFlightDatesXML = function (res) {
	db.serialize(function() {
		var stmt = "SELECT date(daterec) as dateOnly FROM dataset GROUP BY dateOnly";
		db.all(stmt, function (err, rows) {
			var builder = require('xmlbuilder');
			var doc = builder.create('flightDates');
			if(typeof(rows) == 'undefined') {
				res.send(doc.end({ pretty : true }).toString());
				return;
			}
			if (rows.length < 1) {
				res.send(doc.end({ pretty : true }).toString());
				return;
			}
			for (i= 0; i < rows.length; i++) {
				var row = rows[i];
				if (typeof(row) == 'undefined') {
					continue;
				} else {
					doc.ele('date').txt(row.dateOnly).up();
				}
			}
			doc.end({ pretty : true });
			res.send(doc.toString());
		});
	});
}

//Websocket (socket.io) functions
/** Function emitJSON (Websocket socket.io)
This function will retrive one dataset with the given timestamp and optionally a specific source from the database.
It will then return return the the dataset if avaiable as JSON array, otherwise it will return an empty JSON array. 
The timestamp value is mandatory.
The src variable is optional.
@param timestamp: timestamp in format (YYYY-MM-DD HH:MM:SS).
@param callback: the callback function which will process the data on cleint side
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.emitJSON = function (timestamp, callback, source, src) {
	db.serialize(function() {
		var stmt = "SELECT * FROM dataset WHERE daterec LIKE \"" + timestamp + "\"";
		if (source)
			var stmt = "SELECT * FROM dataset WHERE daterec LIKE \"" + timestamp + "\" AND src LIKE \"" + src + "\"";
		db.get(stmt, function (err, row) {
			if (typeof(row) == 'undefined') {
				callback(false, '[{}]');
			} else {
				callback(false, createJSONDataset(new Array(row)));
			}
		});
	});
}

/** Function emitXML (Websocket socket.io)
This function will retrive one dataset with the given timestamp and optionally a specific source from the database.
It will then return the the dataset if avaiable as XML file, otherwise it will return an empty XML file. 
The timestamp value is mandatory.
The src variable is optional.
@param timestamp: timestamp in format (YYYY-MM-DD HH:MM:SS).
@param callback: the callback function which will process the data on cleint side
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.emitXML = function (timestamp, callback, source, src) {
	db.serialize(function() {
		var stmt = "SELECT * FROM dataset WHERE daterec LIKE \"" + timestamp + "\"";
		if (source)
			var stmt = "SELECT * FROM dataset WHERE daterec LIKE \"" + timestamp + "\" AND src LIKE \"" + src + "\"";
		db.get(stmt, function (err, row) {
			callback(false, createXMLDataset(new Array(row)));
		});
	});	
}

/** Function emitInterval (Websocket socket.io)
This function will retrive datasets between two timestamps and optionally a specific source from the database.
It will then return the the datasets if avaiable as XML file or JSON array, otherwise it will return an empty XML file or empty JSON array, depending on the boolean xml variable.
The second timestamp is calculated from the given timestamp into the future.
The timestamp value is mandatory.
The src variable is optional.
@param xml: boolean if return format schould be XML or JSON.
@param timestamp: timestamp in format (YYYY-MM-DD HH:MM:SS).
@param seconds: integer seconds to determine second timestamp.
@param callback: the callback function which will process the data on cleint side
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.emitInterval = function (xml, timestamp, seconds, callback, source, src) {

	//var secondsf = parseFloat(seconds);
	//var diff_ms = (secondsf.toFixed() - secondsf) * 1000;
	
	db.serialize(function() {
		var stmt = "SELECT * FROM dataset WHERE daterec BETWEEN  datetime\(\"" + timestamp + "\"\) AND datetime\(\"" + timestamp + "\", +\'" + seconds + " seconds\'" + "\)";
		if (source)
			var stmt = "SELECT * FROM dataset WHERE src LIKE \"" + src + "\" AND daterec BETWEEN  datetime\(\"" + timestamp + "\"\) AND datetime\(\"" + timestamp + "\", +\'" + seconds + " seconds\'" + "\)";
		db.all(stmt, function (err, rows) {
			if (xml)
				callback(false, createXMLDataset(rows));
			else
				callback(false, createJSONDataset(rows));
		});
	});
}

/** Function emitFLDataset (Websocket socket.io)
This function will select the first or the last dataset of an specific flight day and optionally a specific source from the database.
It will then return the the dataset if avaiable as XML file or JSON array, otherwise it will return an empty XML file or empty JSON array, depending on the boolean xml variable.
The timestamp value is mandatory.
The src variable is optional.
@param xml: boolean if return format schould be XML or JSON.
@param smallTimestamp: timestamp in format (YYYY-MM-DD).
@param callback: the callback function which will process the data on cleint side
@param last: boolean if last dataset schould be returned otherwise first will be returned.
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.emitFLDataset = function (xml, smallTimestamp, callback, last, source, src) {
	db.serialize(function() {
		if (source) {
			var stmt = "SELECT *,date(daterec) as dateOnly FROM dataset WHERE dateOnly LIKE \"" + smallTimestamp + "\" AND src LIKE \"" + src + "\" ORDER BY daterec ASC LIMIT 1";
			if (last)
				var stmt = "SELECT *,date(daterec) as dateOnly FROM dataset WHERE dateOnly LIKE \"" + smallTimestamp + "\" AND src LIKE \"" + src + "\"  ORDER BY daterec DESC LIMIT 1";
		} else {
			var stmt = "SELECT *,date(daterec) as dateOnly FROM dataset WHERE dateOnly LIKE \"" + smallTimestamp + "\" ORDER BY daterec ASC LIMIT 1";
			if (last)
				var stmt = "SELECT *,date(daterec) as dateOnly FROM dataset WHERE dateOnly LIKE \"" + smallTimestamp + "\" ORDER BY daterec DESC LIMIT 1";
		}
		db.all(stmt, function (err, rows) {
			if (xml)
				callback(false, createXMLDataset(rows));
			else
				callback(false, createJSONDataset(rows));
			
				
		});
	});
}

/** Function emitNextDataset (Websocket socket.io)
This function will select the next dataset in timeline from the given timestamp and optionally a specific source from the database.
It will then return the the dataset if avaiable as XML file or JSON array, otherwise it will return an empty XML file or empty JSON array, depending on the boolean xml variable.
The timestamp value is mandatory.
The src variable is optional.
@param xml: boolean if return format schould be XML or JSON.
@param timestamp: timestamp in format (YYYY-MM-DD HH:MM:SS).
@param callback: the callback function which will process the data on cleint side
@param source: boolean if source is available.
@param src: string Enumeration.
**/
exports.emitNextDataset = function (xml, timestamp, callback, source, src) {
	db.serialize(function() {
		var stmt = "SELECT * FROM dataset WHERE daterec > \"" + timestamp + "\" ORDER BY daterec ASC LIMIT 1";
		if (source)
			var stmt = "SELECT * FROM dataset WHERE daterec > \"" + timestamp + "\" AND src LIKE \"" + src + "\" ORDER BY daterec ASC LIMIT 1";
		db.all(stmt, function (err, rows) {
		if (xml)	
			callback(false, createXMLDataset(rows));
		else	
			callback(false, createJSONDataset(rows));
		});
	});
}

/** Function emitFlightDatesJSON (Websocket socket.io)
This function will select all flight days in format (YYYY-MM-DD) from the database and optionally filter them by a specific source.
It will then return the the flight days if avaiable as XML file, otherwise it will return an empty XML file.
The timestamp value is mandatory.
The src variable is optional.
@param callback: the callback function which will process the data on cleint side
**/
exports.emitFlightDatesJSON = function (callback) {
	db.serialize(function() {
		var stmt = "SELECT date(daterec) as dateOnly FROM dataset GROUP BY dateOnly";
		db.all(stmt, function (err, rows) {
			var result = '[';
			if(typeof(rows) == 'undefined') {
				callback(false, result.concat('{}]'));
				return;
			}
			if (rows.length < 1) {
				callback(false, result.concat('{}]'));
				return;
			}
			for (i= 0; i < rows.length; i++) {
				var row = rows[i];
				if (typeof(row) == 'undefined') {
					continue;
				} else {
					result = result.concat('{ \"date\" : \"');
					result = result.concat(row.dateOnly);
					result = result.concat('\"}');
					if(i < (rows.length - 1))
						result = result.concat(',');
				}
			}
			result = result.concat(']')
			callback(false, result);
		});
	});
}

/** Function emitFlightDatesXML (Websocket socket.io)
This function will select all flight days in format (YYYY-MM-DD) from the database and optionally filter them by a specific source.
It will then return the the flight days if avaiable as JSON array, otherwise it will return an empty JSON array.
The timestamp value is mandatory.
The src variable is optional.
@param callback: the callback function which will process the data on cleint side
**/
exports.emitFlightDatesXML = function (callback) {
	db.serialize(function() {
		var stmt = "SELECT date(daterec) as dateOnly FROM dataset GROUP BY dateOnly";
		db.all(stmt, function (err, rows) {
			var builder = require('xmlbuilder');
			var doc = builder.create('flightDates');
			if(typeof(rows) == 'undefined') {
				callback(false, doc.end({ pretty : true }).toString());
				return;
			}
			if (rows.length < 1) {
				callback(false, doc.end({ pretty : true }).toString());
				return;
			}
			for (i= 0; i < rows.length; i++) {
				var row = rows[i];
				if (typeof(row) == 'undefined') {
					continue;
				} else {
					doc.ele('date').txt(row.dateOnly).up();
				}
			}
			doc.end({ pretty : true });
			callback(false, doc.toString());
		});
	});
}

 //helper functions
 /** Function createJSONDataset
This function will create an JSON array with none, one or multiple datasets.
@param rows: an row array
**/
function createJSONDataset(rows) {
	var result = '[';
	if(typeof(rows) == 'undefined')
		return result.concat('{}]');
	if (rows.length < 1)
		return result.concat('{}]');
	for (i= 0; i < rows.length; i++) {
		var row = rows[i];

		if (typeof(row) == 'undefined') {
			continue;
		} else {
			result = result.concat('{');
			result = result.concat('\"daterec\" : \"');
			result = result.concat(row.daterec);
			result = result.concat('\", \"voltage\" : \"');
			result = result.concat(row.voltage);
			result = result.concat('\", \"humidity\" : \"');
			result = result.concat(row.humidity);
			result = result.concat('\", \"itemp\" : \"');
			result = result.concat(row.itemp);
			result = result.concat('\", \"otemp\" : \"');
			result = result.concat(row.otemp);
			result = result.concat('\", \"lat\" : \"');
			result = result.concat(row.lat);
			result = result.concat('\", \"lon\" : \"');
			result = result.concat(row.lon);
			result = result.concat('\", \"altitude\" : \"');
			result = result.concat(row.altitude);
			result = result.concat('\", \"hVelocity\" : \"');
			result = result.concat(row.hVelocity);
			result = result.concat('\", \"vVelocity\" : \"');
			result = result.concat(row.vVelocity);
			result = result.concat('\", \"dVelocity\" : \"');
			result = result.concat(row.dVelocity);
			result = result.concat('\", \"source\" : \"');
			result = result.concat(row.src);
			result = result.concat('\", \"precision\" : \"');
			result = result.concat(row.precision);
			result = result.concat('\", \"bAltitude\" : \"');
			result = result.concat(row.bAltitude);
			result = result.concat('\", \"pres\" : \"');
			result = result.concat(row.pres);
			result = result.concat('\"}');
			if(i < (rows.length - 1))
				result = result.concat(',');
		}
	}
	result = result.concat(']');
	return result;
}

 /** Function createXMLDataset
This function will create an XML file with none, one or multiple datasets.
@param rows: an row array
**/
function createXMLDataset(rows) {
	var builder = require('xmlbuilder');
	var doc = builder.create('balloonData');
	if(typeof(rows) == 'undefined')
		return doc.end({ pretty : true }).toString();
	if (rows.length < 1)
		return doc.end({ pretty : true }).toString();
	for (i= 0; i < rows.length; i++) {
		var row = rows[i];
		if (typeof(row) == 'undefined') {
			continue;
		} else {
		var altitude
			doc.ele('dataset')
			.ele('daterec')
			.txt(row.daterec != null ? row.daterec : 'null')
			.up()
			.ele('voltage')
			.txt(row.voltage != null ? row.voltage : 'null')
			.up()
			.ele('humidity')
			.txt(row.humidity != null ? row.humidity : 'null')
			.up()
			.ele('itemp')
			.txt(row.itemp != null ? row.itemp : 'null')
			.up()
			.ele('otemp')
			.txt(row.otemp != null ? row.otemp : 'null')
			.up()
			.ele('lat')
			.txt(row.lat != null ? row.lat : 'null')
			.up()
			.ele('lon')
			.txt(row.lon != null ? row.lon : 'null')
			.up()
			.ele('altitude')
			.txt(row.altitude != null ? row.altitude : 'null')
			.up()
			.ele('hVelocity')
			.txt(row.hVelocity != null ? row.hVelocity : 'null')
			.up()
			.ele('vVelocity')
			.txt(row.vVelocity != null ? row.vVelocity : 'null')
			.up()
			.ele('dVelocity')
			.txt(row.dVelocity != null ? row.dVelocity : 'null')
			.up()
			.ele('source')
			.txt(row.src != null ? row.src : 'null')
			.up()
			.ele('precision')
			.txt(row.precision != null ? row.precision : 'null')
			.up()
			.ele('bAltitude')
			.txt(row.bAltitude != null ? row.bAltitude : 'null')
			.up()
			.ele('pres')
			.txt(row.pres != null ? row.pres : 'null')
			.up();
		}
	}
	doc.end({ pretty : true });
	return doc.toString();
}

 /** Function hDistance
This function will return the distance between two geographical decimal coordinates.
@param lat0: first geographical latitude value.
@param lon0: first geographical longitude value.
@param lat1: second geographical latitude value.
@param lon1: second geographical longitude value.
**/
function hDistance(lat0, lon0, lat1, lon1) {
	//calculate spherical coordinates
	var rho = 6378137; // earth diameter in meter
	var phi1 = (90.0 - lat0) * Math.PI/180.0;
	var phi2 = (90.0 - lat1) * Math.PI/180.0;
	var theta1 = lon0 * Math.PI/180.0;
	var theta2 = lon1 * Math.PI/180.0;
	var dist = rho * Math.acos( Math.sin(phi1) * Math.sin(phi2) * Math.cos(theta1 - theta2) + Math.cos(phi1) * Math.cos(phi2));
	return dist;
}

 /** Function dDistance
This function will return the distance between two geographical decimal coordinates and the two altitude values.
@param lat0: first geographical latitude value.
@param lon0: first geographical longitude value.
@param alt0: first altitude value.
@param lat1: second geographical latitude value.
@param lon1: second geographical longitude value.
@param alt1: second altitude value.
**/
function dDistance(lat0, lon0, alt0, lat1, lon1, alt1) {
	var rho = 6378137; // earth diameter in meter
	//point transformation
	x0 = (alt0 + rho) * Math.cos(lat0) * Math.sin(lon0)
	y0 = (alt0 + rho) * Math.sin(lat0)
	z0 = (alt0 + rho) * Math.cos(lat0) * Math.cos(lon0)
	x1 = (alt1 + rho) * Math.cos(lat1) * Math.sin(lon1)
	y1 = (alt1 + rho) * Math.sin(lat1)
	z1 = (alt1 + rho) * Math.cos(lat1) * Math.cos(lon1)
	//simple vector algebra (dot product)
	var dist = Math.sqrt(Math.abs((x1-x0)^2 + (y1-y0)^2 + (z1-z0)^2))
	return dist;
}

 /** Function speed
This function will return the speed from a given distance and time.
@param distance: distance.
@param time: timespan.
**/
function speed(distance, time) {
	//v = s/t
	var v = distance/time;
	return v;
}