/**
This is an implementation of a Web Application Server for the Master Course Software Technology.
@author: Dan Follwarczny
**/

/** Function writeJson
This Function will extract the body of the request.
It will then log the body which is expected JSON encoded.
It will then call the insertJSON Function in the database component.
@param req: the http request object.
@param res: the http response object.
@param io: the Websocket variable
**/
exports.writeJson = function (req, res, io) {
    var content = '';
    var database = require('../database/database');
	
    req.on('data', function (data) {
       content += data;
    });

    req.on('end', function () {
       var data = JSON.parse(content);
	   console.log('WRITE DATASET');
	   console.log(data);
	   database.insertJSON(res, data, io);
    });
};

/** Function writeXML
NOT YET IMPLEMENTED
This Function will extract the body of the request.
It will then log the body which is expected XML encoded.
It will then call the insertXML Function in the database component.
@param req: the http request object.
@param res: the http response object.
@param io: the Websocket variable
**/
exports.writeXML = function (req, res, io) {
	var content = '';

	req.on('data', function (data) {
		content += data;
	});

	req.on('end', function () {
	var xmlfile = require('xmldoc');
	var document = new xmlfile.XmlDocument(content);
	//Todo not yet implemented
	//database.insertXML(res, data); 
	//'Element id =' + document.valueWithPath('ID')
    res.send(' not yet implemented ');
	});
};