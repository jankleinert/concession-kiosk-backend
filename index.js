const express = require('express');
const app = express();
const host = process.env.IP  || '0.0.0.0';
const port = process.env.PORT || 8080;

var ridesList = {
    rides: [
        { id: "123", name: "Compile Driver", wait: 30},
        { id: "234", name: "Wild West", wait: 5}
    ]    
}

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  	next();
});

app.get('/allrides/', function (req, res, next) {
		
	res.send({success: true, result: ridesList});

});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something went wrong.')
});

app.listen(port, host);
console.log('Wait Tracker Backend started on: ' + host + ':' + port);