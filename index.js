const express = require('express');
const app = express();
const host = process.env.IP  || '0.0.0.0';
const port = process.env.PORT || 8080;
const dbUri = process.env.uri || 'mongodb://localhost:27017';
const dbName = process.env.database_name || 'sampledb';
const dbUser = process.env.username;
const dbPassword = process.env.password;
const mongo = require('mongodb').MongoClient;

app.get('/ticketNumber', function(req, res, next) {
	res.send({success: true, result: 999});
});

app.get('/initdb', function (req, res, next) {
	var ridesList;
	let connectString = dbUri; 
	console.log(dbName);
	console.log('connect string: ' + connectString);
	if (dbUser && dbPassword) {
		console.log('have username and password ' + dbUser + ' ' + dbPassword);
		connectString = dbUri.replace('mongodb://', 'mongodb://' + dbUser + ':' + dbPassword + '@');
		connectString += '/' + dbName;
		console.log('connect string after replace: ' + connectString);
		
	}
	console.log('connect string after if ' + connectString);
	mongo.connect(connectString, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		console.log(connectString);
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
	let connectString = dbUri;
	if (dbUser && dbPassword) {
		console.log('have username and password ' + dbUser + ' ' + dbPassword);
		connectString = dbUri.replace('mongodb://', 'mongodb://' + dbUser + ':' + dbPassword + '@');
		connectString += '/' + dbName;
		console.log(connectString);
	}
	mongo.connect(connectString, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		console.log(connectString);
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
console.log('Wait Tracker Backend started on: ' + host + ':' + port);