
var port = 8080;
var express = require('express');
var app = express();
var authRouter = express.Router();
var apiRouter = express.Router();

// define location fo static files
var staticDir = __dirname + '/static';

// use body-parser to parse post contents
var bodyParser = require('body-parser');
app.use(bodyParser());

// authentication routes
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

authRouter.post('/admin', function(req, res){
	var reply = {
		allowed: false
	};
	if(req.body.username == 'fat' && req.body.password == 'fat'){
		reply = {
			allowed: true
		};
	}
	res.json(reply);
});

authRouter.get('/about', function(req, res){
	//res.send('About page');
	res.sendfile(staticDir + '/about.html');
})




// API for maps
apiRouter.get('/layers', function(req, res){
	res.send('List all layers');
});




app.use(express.static(__dirname + '/static'));
app.use('/auth', authRouter);
app.use('/api', apiRouter);






var server = app.listen(port, function(){
	console.log('Listening on port %d', port);
});
