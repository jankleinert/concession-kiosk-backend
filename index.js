const express = require('express');
const app = express();
const host = process.env.IP  || '0.0.0.0';
const port = process.env.PORT || 8080;
const mongo = require('mongodb').MongoClient;

const mongoUri = process.env.uri;
const mongoUsername = process.env.username || process.env.MONGODB_USER;
const mongoPassword = process.env.password || process.env.MONGODB_PASSWORD;
const dbName = process.env.database_name || 
			   process.env.MONGODB_DBNAME || 
			   process.env.MONGODB_DATABASE ||
			   'sampledb';
const dbServiceName = process.env.DATABASE_SERVICE_NAME || 'localhost';

var dbConnectionUrl;

// If the monogo secret has been attached, modify the provided URI to include
// authentication credentials
if (mongoUri) {
	var auth = mongoUsername + ':' + mongoPassword + '@'
	var pieces = mongoUri.split('//');
	dbConnectionUrl = pieces[0] + '//' + auth + pieces[1] + '/' + dbName;
}
else if (process.env.MONGODB_URL){
	dbConnectionUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/sampledb';
} else {
	dbConnectionUrl = 'mongodb://' + mongoUsername + ':' + 
					mongoPassword + '@' + 
					dbServiceName + ':27017/' 
					+ dbName;
}

app.get('/ticketNumber', function(req, res, next) {
	let newTicketNumber = 100;
	mongo.connect(dbConnectionUrl, (err, client) => {
		if (err) {
		  console.error(err);
		  res.send({success: false, result: 9999});
		} else {
			const db = client.db(dbName);
			const collection = db.collection('orders');
			collection.find({}).count().then((n) => {
				if (n > 0) {
					collection.find().sort({ticketNumber:-1}).limit(1).toArray((err, items) => {
						let highestTicket = items[0].ticketNumber;
						newTicketNumber = highestTicket + 1;
						collection.insertOne({ticketNumber: newTicketNumber, order: req.query}, (err, result) => {
							console.log('err:' + err, ' result: ' + result);
						});
						res.send({success: true, result: newTicketNumber, order: req.query});
					});
				} else {
					collection.insertOne({ticketNumber: newTicketNumber, order: req.query}, (err, result) => {
						console.log('err:' + err, ' result: ' + result);
					});
					res.send({success: true, result: newTicketNumber, order: req.query});
				}
			}).catch((err) => {
				console.log(err);
				res.send({success: false, result: 999});
			});
		}
	});
});

/* for debugging purposes */
app.get('/allorders', function (req, res, next) {
	var ordersList;

	mongo.connect(dbConnectionUrl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		console.log(dbConnectionUrl);
		const db = client.db(dbName);
		const collection = db.collection('orders');
		collection.find().toArray((err, items) => {
			ordersList = items;
			console.log(ordersList);
			res.send({success: true, result: ordersList});
		});
	});
});

app.get('/debug', function(req, res, next) {

	var details = {
		"mongo_url": dbConnectionUrl,
		"connected": false
	};

	mongo.connect(dbConnectionUrl, (err, client) => {
		if (err) {
			console.error(err)
		} else {
			console.log('Connected to Mongo')
			details["connected"] = true;
			console.log("Updated details")
		}
		res.send(details);
	});
});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something went wrong.')
});

app.listen(port, host);
console.log('Concession Kiosk Backend started on: ' + host + ':' + port);