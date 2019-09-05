const express = require('express');
const app = express();
const host = process.env.IP  || '0.0.0.0';
const port = process.env.PORT || 8080;
const dbConnectionUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/sampledb';
const dbName = process.env.MONGODB_DBNAME || 'sampledb';
const mongo = require('mongodb').MongoClient;

app.get('/ticketNumber', function(req, res, next) {
	res.send({success: true, result: 999});
});

app.get('/initdb', function (req, res, next) {
	var ridesList;
	console.log(dbConnectionUrl);

	mongo.connect(dbConnectionUrl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		console.log(dbConnectionUrl);
		const db = client.db(dbName);
		const collection = db.collection('rides');
		collection.insertMany([{id: '123', name: 'Compile Driver', wait: 30}, {id: '234', name: 'Wild West', wait: 5}], (err, result) => {
			console.log('err:' + err, ' result: ' + result);
		});
		

		collection.find().toArray((err, items) => {
			ridesList = items;
			console.log(items);
		});
	  });
	console.log(ridesList);	
	res.send({success: true, result: ridesList});
});

app.get('/allrides/', function (req, res, next) {
	var ridesList;

	mongo.connect(dbConnectionUrl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		console.log(dbConnectionUrl);
		const db = client.db(dbName);
		const collection = db.collection('rides');
		collection.find().toArray((err, items) => {
			ridesList = items;
			console.log(items);
		});
	  })
	  console.log(ridesList);		
	res.send({success: true, result: ridesList});

});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something went wrong.')
});

app.listen(port, host);
console.log('Concession Kiosk Backend started on: ' + host + ':' + port);