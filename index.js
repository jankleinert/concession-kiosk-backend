const express = require('express');
const app = express();
const host = process.env.IP  || '0.0.0.0';
const port = process.env.PORT || 8080;
const { MongoClient } = require('mongodb');

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
  const client = new MongoClient(dbConnectionUrl);

	let newTicketNumber = 100;

  async function run() {
    try {
      const database = client.db(dbName);
      const collection = await database.collection('orders');

			let count = await collection.count();

			if (count > 0) {
				let orders = await collection.find().sort({ticketNumber: -1}).toArray();
        let highestTicket = orders[0].ticketNumber;
				newTicketNumber = highestTicket + 1;

        try {
          console.log("inserting real");
          await collection.insertOne({ticketNumber: newTicketNumber, order: req.query});
          console.log("inserting fake");
          await collection.insertOne({ _id: 1 });
          console.log("inserting fake again");
          await collection.insertOne({ _id: 1 });
        } catch (error) {
          console.log("error");
          console.log(error);
        }
				res.send({success: true, result: newTicketNumber, order: req.query});
			} else {
				await collection.insertOne({ticketNumber: newTicketNumber, order: req.query}, (err, result) => {
          console.log("inserting first one");
					console.log('err:' + err, ' result: ' + result);
				});
				res.send({success: true, result: newTicketNumber, order: req.query});
			}
    } finally {
      await client.close()
    }
  }
  run().catch(console.dir);
});

/* for debugging purposes */
app.get('/allorders', function (req, res, next) {
  const client = new MongoClient(dbConnectionUrl);

  async function run() {
    try {
      const database = client.db(dbName);
      let orders = await database.collection('orders').find().toArray();
      res.send({
        success: true,
        orders: orders,
      });
    } finally {
      await client.close()
    }
  }
  run().catch(console.dir);
});

app.get('/debug', function(req, res, next) {
  const client = new MongoClient(dbConnectionUrl);

  async function run() {
    try {
      const database = client.db(dbName);
      const collections = await database.listCollections().toArray();
      res.send({
        mongo_url: dbConnectionUrl,
        collections: collections,
      });
    } finally {
      await client.close()
    }
  }
  run().catch(console.dir);
});

app.get('/', function(req, res, next) {
  console.log("received!")
  res.send({
    received: true
  });
});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something went wrong.')
});

app.listen(port, host);
console.log('Concession Kiosk Backend started on: ' + host + ':' + port);