/**
This is an implementation of a Web Application Server for the Master Course Software Technology.
@author: Dan Follwarczny
**/

//access variable for the express module
var express = require('express');

//define variables for routes
var read = require('./routes/read'),
 write = require('./routes/write');

//Port on which the server will run
var port = 8000;

//define server variable using express 
var app = express();

//make the body parser available
app.use(express.bodyParser());

//create a http server using the express framework
var server = require('http').createServer(app);

//access variable for the socket.io module
var socket = require('socket.io');

//Add Websocket to the server
var io = socket.listen(server);

//access variable for a file system
var fs = require("fs");

/** socket.io Websocket implementation 
This is the Websocket Interface implementation. 
It defines the event listeners and emit events for the Websocket.
@param socket: socket.io variable.
**/
io.on('connection', function(socket){
	
	/** Emit news event
	Emit the news event which informs the client that it is connected to the server
	**/
	socket.emit('news', 'connected to server');
	
	/** Listener for getData events 
	This function will listen on getData events emitted by the Client.
	It will call the emitDataset function.
	@param param: defined parameters json encoded.
	@param callback: callback function which will process the returned data on client side.
	**/
	socket.on('getData', function (param, callback) {
		read.emitDataset(param, callback)
	});
	
	/** Listener for getFlightDates events 
	This function will listen on getFlightDates events emitted by the Client.
	It will call the emitFlightDates function.
	@param param: defined parameters json encoded.
	@param callback: callback function which will process the returned data on client side.
	**/
	socket.on('getFlightDates', function (param, callback) {
		read.emitFlightDates(param, callback)
	});
	
	/** Video stream provider 
	This function will listen on getStream events emitted by the Client.
	It will return a video which is identified by name in blob data chunks.
	@param req: the http request object
	**/
	socket.on('getStream', function (req) {
		var readStream = fs.createReadStream('./video/' + req.name);
		readStream.addListener('data', function(data)
		{
			socket.emit('VS',data);
		});
	});
	
	/** Listener for getDropboxLinks events 
	This function will listen on getDropboxLinks events emitted by the Client.
	It will call the emitDropboxLinks function.
	@param param: defined parameters json encoded.
	@param callback: callback function which will process the returned data on client side.
	**/
	socket.on('getDropboxLinks', function (param, callback) {
		read.emitDropboxLinks(param, callback)
	});
	
});

/** REST API implemenatation data route
This will process all GET requests incoming on the data route
It will redirect the request to the read component and call the getDataSet function
**/
app.get('/data', read.getDataSet);

/** REST API implemenatation drop route
This will process all GET requests incoming on the drop route
It will redirect the request to the read component and call the getDropboxLinks function
**/
app.get('/drop', read.getDropboxLinks);

//access variable for a file system
var fs = require('fs');

/** Load Index File
This will read the Index.html file from the public folder into the index variable.
**/
var index = fs.readFileSync('./public/Index.html');

/** Redirect unrouted requests
This will return the Index.html file to all requests which are not routed.
Example: http://ballon.hft-stuttgart.de
**/
app.get('/', function(req, res) {
	res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(index);
    res.end();
});

//access variable for path
var path = require('path');

/** Make public folder  aviable
The following implementation will make the public folder available and return any requested file in this folder
**/
app.use(express.static(path.join(__dirname, 'public')));

/** Make public/js folder aviable
The following implementation will make the public/js folder available and return any requested file in this folder
**/
app.use("/js", express.static(__dirname + '/public/js'));

/** Make public/css folder aviable
The following implementation will make the public/css folder available and return any requested file in this folder
**/
app.use("/css", express.static(__dirname + '/public/css'));

/** Express router setting
Note the use of app.router, which can (optionally) be used to mount the application routes, 
otherwise the first call to app.get(), app.post(), etc will mount the routes.
**/
app.use(app.router);

/** REST API implementation json route
This will process all POST requests incoming on the json route
It will redirect the request to the write component and call the writeJson function
@param req: the http request object.
@param res: the http response object.
**/
app.post('/json', function(req, res) {
	write.writeJson(req, res, io);
});

/** REST API implemenatation xml route
NOT YET IMPLEMENTED
This will process all POST requests incoming on the xml route
It will redirect the request to the write component and call the writeXML function
**/
app.post('/xml', write.writeXML);

//Start server on specified Port
server.listen(port);

//Server started message
console.log('HFTBallooning data processing server started');
console.log("Server listen on http://ballon.hft-stuttgart.de on Port: " + port);

