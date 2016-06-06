/**
This is an implementation of a Web Application Server for the Master Course Software Technology.
@author: Dan Follwarczny
**/

/** Function getDataSet (REST API)
This Function will extract the request parameter.
Parameter are expected URL encoded
According to the extracted parameters different functions in the database component will be called.
@param req: the http request object.
@param res: the http response object.
**/
exports.getDataSet = function(req, res) {
    var database = require('../database/database');
	var sec = false;
	var fl = false;
	var last = false;
	var nextT = false;
	var flightDates = false;
	var source = false;
	if (typeof(req.param('format')) != 'undefined'){
		var equalXML = req.param('format').toUpperCase() == 'XML';
	}
	if (typeof(req.param('timestamp')) != 'undefined'){
		var timestamp = req.param('timestamp');
		if (!secure(timestamp))
			return;
	}
	if (typeof(req.param('src')) != 'undefined'){
		var src = req.param('src');
		source = true;
		if (!secure(src))
			return;
	}
	if (typeof(req.param('next')) != 'undefined'){
		var next = req.param('next');
		nextT = true;
		if (!secure(next))
			return;
	}
	if (typeof(req.param('seconds')) != 'undefined'){
		var seconds = req.param('seconds');
		sec = true;
	}
	if (typeof(req.param('flightDates')) != 'undefined'){
		if (req.param('flightDates').toUpperCase() == 'TRUE')
			flightDates = true;
	}
	if (typeof(req.param('dataset')) != 'undefined'){
		fl = true;
		if (req.param('dataset').toUpperCase() == 'LAST')
			last = true;
	}
	
	//default return is json
	if (flightDates) {
		if (equalXML)
			database.sendFlightDatesXML(res);
		else
			database.sendFlightDatesJSON(res)
	} else if (fl) {
		if (!secure(req.param('date')))
			return;
		if (last)
			database.sendFLDataset(equalXML, res, req.param('date'), true, source, src);
		else
			database.sendFLDataset(equalXML, res, req.param('date'), false, source, src);
	} else if (sec) {
		database.sendInterval(equalXML, res, timestamp, seconds, source, src);
	} else if (nextT) {
		database.sendNextDataset(equalXML, res, next, source, src);
	} else {
		if (equalXML)
			database.sendXML(res, timestamp, source, src);
		else
			database.sendJSON(res, timestamp, source, src);
	}
};

/** Function emitDataset (Websocket socket.io)
This Function will extract the request parameter.
Parameter are expected JSON encoded
According to the extracted parameters different functions in the database component will be called.
@param param: defined parameters JSON encoded.
@param callback: callback function which will process the returned data on client side.
**/
exports.emitDataset = function(params, callback) {
	var database = require('../database/database');
	var param = JSON.parse(params);
	var source = false;
	var xml = false;
	if (!secure(param.timestamp) || !secure(param.seconds) || !secure(param.next) || !secure(param.src))
		return;
	if (typeof(param.src) != 'undefined')
		source = true;
	if (param.format.toUpperCase() == 'XML')
		xml = true;
	if (typeof(param.dataset)  != 'undefined') {
		if (param.dataset.toUpperCase() == 'LAST')
			database.emitFLDataset(xml, param.date, callback, true, source, param.src);
		else
			database.emitFLDataset(xml, param.date, callback, false, source, param.src);
	} else if (typeof(param.seconds) != 'undefined') {
		database.emitInterval(xml, param.timestamp, param.seconds, callback, source, param.src);
	} else if (typeof(param.next)  != 'undefined') {
		database.emitNextDataset(xml, param.next, callback, source, param.src)
	} else {
		if (xml)
			database.emitXML(param.timestamp, callback, source, param.src);
		else
			database.emitJSON(param.timestamp, callback, source, param.src);
	}
};

/** Function emitFlightDates (Websocket socket.io)
This Function will extract the request parameter.
Parameter are expected JSON encoded
According to the extracted parameters different functions in the database component will be called.
@param param: defined parameters JSON encoded.
@param callback: callback function which will process the returned data on client side.
**/
exports.emitFlightDates = function(params, callback) {
    var database = require('../database/database');
	var param = JSON.parse(params);
	if (param.format.toUpperCase() == 'XML'){
		database.emitFlightDatesXML(callback);
	} else {
		database.emitFlightDatesJSON(callback);
	}
};

/** Function emitDropboxLinks (Websocket socket.io)
This Function will extract the request parameter.
Parameter are expected JSON encoded
According to the extracted parameters different functions in the database component will be called.
@param param: defined parameters JSON encoded.
@param callback: callback function which will process the returned data on client side.
**/
exports.emitDropboxLinks = function(params, callback) {
    var dropbox = require('../dropbox/drop');
	var param = JSON.parse(params);
	if (param.type == 'getPreviewLink'){
		dropbox.getPreviewLink(param.folderName, callback);
	} else if (param.type == 'getDownloadLink') {
		dropbox.getDownloadLink(param.folderName, callback);
	} else if (param.type == 'getAllFilesPreviewLink') {
		dropbox.getAllFilesPreviewLink(callback);
	} else if (param.type == 'getAllFilesDownloadLink') {
		dropbox.getAllFilesDownloadLink(callback);
	}
};

/** Function getDropboxLinks (REST API)
This Function will extract the request parameter.
Parameter are expected URL encoded
According to the extracted parameters different functions in the database component will be called.
@param req: the http request object.
@param res: the http response object.
**/
exports.getDropboxLinks = function(req, res) {
	var dropbox = require('../dropbox/drop');
	
	if (typeof(req.param('type')) != 'undefined'){
		var type = req.param('type');
	}
	if (typeof(req.param('folderName')) != 'undefined'){
		var folderName = req.param('folderName');
	}
	if (type == 'getPreviewLink'){
		dropbox.getPreviewLinkREST(folderName, res);
	} else if (type == 'getDownloadLink') {
		dropbox.getDownloadLinkREST(folderName, res);
	} else if (type == 'getAllFilesPreviewLink') {
		dropbox.getAllFilesPreviewLinkREST(res);
	} else if (type == 'getAllFilesDownloadLink') {
		dropbox.getAllFilesDownloadLinkREST(res);
	}
}

/** Function secure
This Function will check string values on special charackters to avoid code injection.
@param value: String value to be checked.
**/
function secure(value) {
	if (typeof(value) == 'undefined')
		return true;
	if (value.indexOf('/') != -1)
		return false;
	if (value.indexOf('"') != -1)
		return false;
	if (value.indexOf('\'') != -1)
		return false;
	if (value.indexOf('&') != -1)
		return false;
	return true;
}
