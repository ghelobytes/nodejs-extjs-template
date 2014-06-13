
var port = 8080;
var express = require('express');
var app = express();

// prepare routes
var authRouter = express.Router();
var apiRouter = express.Router();

// define location fo static files
var staticDir = __dirname + '/static/app';

// use body-parser to parse post contents
var bodyParser = require('body-parser');
app.use(bodyParser());

// configure to server static contents
app.use(express.static(staticDir));



/************************
 *
 *     OTHER ROUTES
 *
 ************************/

// handle: /map
app.get('/map', function(req, res){
	res.sendfile(staticDir + '/map.html');
});


/************************
 *
 * AUTHENTICATION ROUTES
 *
 ************************/

// configure authentication routes
app.use('/auth', authRouter);
 
// handle: /auth/member
authRouter.post('/member', function(req, res){
	var reply = {
		allowed: false
	};
	if(req.body.username == 'ghelo' && req.body.password == 'ghelo'){
		reply = {
			allowed: true
		};
	}
	res.json(reply);
});



/*********************
 *
 *    PROXY ROUTES
 *
 ********************/



/*********************
 *
 *    API ROUTES
 *
 ********************/

// configure api routes
app.use('/api', apiRouter);

// handle: /api/layers
apiRouter.get('/layers', function(req, res){
	var list = ['layer 1', 'layer 2', 'layer 3']
	res.json(list);
});



// start the server
var server = app.listen(port, function(){
	console.log('Listening on port %d', port);
});







////////////////////
var proxyHost = 'localhost';
var proxyPort = '8000';
var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    //requireHeader: ['origin', 'x-requested-with'],
    //removeHeaders: ['cookie', 'cookie2']
}).listen(proxyPort, proxyHost, function() {
    console.log('Running CORS Anywhere on ' + proxyHost + ':' + proxyPort);
});

