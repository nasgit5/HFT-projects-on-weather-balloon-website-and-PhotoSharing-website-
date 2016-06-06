
var fs = require('fs');
var path = require('path');
var dbox = require('dbox'); 
var ext = require('path');


 // varaible initilization=============================
// creates a dropbox client object
dboxapp = dbox.app({
	"app_key": "txjoznvtjza35qj",
	"app_secret": "4umh094np3685ce"
});



// The access token information is saved in the file and are retrieve from there.
var accessTokenFilePath =path.join(__dirname, '/token.json');
var accessToken = JSON.parse(fs.readFileSync(accessTokenFilePath));

// =====================================================

//gives access to all the api functionality.
client = dboxapp.client(accessToken);

// This function will take folder name as input and returns shared link for Preview of all files inside that folder.
exports.getPreviewLink = function(folderName, callback)
{
	client.readdir(folderName+'/', function(status, reply)
	{
		var result = new Array();
		var replyNr = reply.length;
		
		for(var i in reply)
		{
			client.media('/'+reply[i], function(status, reply)
			{
				result.push(reply.url);
				
				replyNr--;
				if(replyNr==0) // added all URLS -> then call callback
					callback(false, result);   
			});   
		}    		
	});	

}	

exports.getPreviewLinkREST = function(folderName,res)
{
	var completeFoldername;
	if(folderName == "/")
		completeFoldername = folderName;
	else
		completeFoldername = folderName+'/';
		
	client.readdir(completeFoldername, function(status, reply)
	{
		var result = new Array();
		var replyNr = reply.length;
		for(var i in reply)
		{
			client.media('/'+reply[i], function(status, reply)
			{
				result.push(reply.url);
				
				replyNr--;
				if(replyNr==0) 
					res.send(result);
			});   
		}       
	});	
} // End Function



// This function will take folder name as input and returns shared link for Download of all files inside that folder.
exports.getDownloadLink = function(folderName,callback){
client.readdir(folderName+'/', function(status, reply){
	for(var i in reply){
		client.shares('/'+reply[i], function(status, reply){
			callback(false,reply.url);
		});   
	}       
});	

} // End Function

exports.getDownloadLinkREST = function(folderName,res){
client.readdir(folderName+'/', function(status, reply){
	for(var i in reply){
		client.shares('/'+reply[i], function(status, reply){
			res.send(reply.url);
		});   
	}       
});	

}

// This function will returns all the files inside our app folder as shared link for Preview.
exports.getAllFilesPreviewLink = function(callback){
client.readdir('/', function(status, reply){
for(var i in reply){
client.media('/'+reply[i], function(status, reply){
callback(false,reply.url);
});   
}       
});	

} // End Function

exports.getAllFilesPreviewLinkREST = function(res){
client.readdir('/', function(status, reply){
for(var i in reply){
client.media('/'+reply[i], function(status, reply){
res.send(reply.url);
});   
}       
});	

}

// This function will returns all the files inside our app folder as shared link for Download.
exports.getAllFilesDownloadLink = function(callback){
client.readdir('/', function(status, reply){
	for(var i in reply){
		client.shares('/'+reply[i], function(status, reply){
			callback(false,reply.url);
		});   
	}       
});	

} // End Function

exports.getAllFilesDownloadLinkREST = function(res){
client.readdir('/', function(status, reply){
	for(var i in reply){
		client.shares('/'+reply[i], function(status, reply){
			res.send(reply.url);
		});   
	}       
});	

}






