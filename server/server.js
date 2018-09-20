const fs = require('fs');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config.js');
const expressjwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const cors = require('cors');
const minifyHTML = require('express-minify-html');
const pm2 = require('pm2');
const multer = require("multer");
const device = require('express-device');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
// const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminOptipng = require('imagemin-optipng');
var compression = require('compression')
const flash = require('flash')

// import geoip from 'geoip-lite'

require('winston-loggly-bulk');

if (config.status == 'production') {
	var pmx = require('pmx').init({
		http: true, // HTTP routes logging (default: true)
		errors: true, // Exceptions logging (default: true)
		custom_probes: true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
		network: true, // Network monitoring at the application level
		ports: true  // Shows which ports your app is listening on (default: false)
	});
	// pmx.notify({ success : false });

}

winston.add(winston.transports.Loggly, {
	token: config.winstonlogger.token,
	subdomain: config.winstonlogger.subdomain,
	tags: config.winstonlogger.tags,
	json: config.winstonlogger.json
});
winston.log('info', "Server Started 1");
global.winston = winston;
global.__base = __dirname;

var port = config.port;

const app = express();

const server = require('http').createServer(app);
var client = require('socket.io')(server);

app.winston = winston;
app.config = config;
app.jwt = jwt;
app.bcrypt = bcrypt;
app.expressjwt = expressjwt;
// app.geoip = geoip;



//setup mongoose
app.db = mongoose.connect(config.mongodb.uri)

app.socket = client
// app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
// app.db.once('open', function () {
// 	console.log(config.mongodb.uri);
// 	//and... we have a data store
// });
app.use(compression())
// Middleware
app.use(express.static(__dirname + '/public', { maxage: '7d' }));
app.use(cors());
app.use(cookieParser('thisisarandomstringofletters'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(device.capture());
// compress all responses

// add all routes


app.use('/api*', require('./middleware/decodeJWT').decodeToken);

app.use('/web*', require('./middleware/decodeJWTWeb').decodeToken);




//config data models
require('./engine').initRouteAndSchema(app, mongoose);

// Settings

// app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');

//setup utilities
// app.utility = {};
// app.utility.emailtransporter = require('./util/sendmail');
// app.utility.workflow = require('./util/workflow');


// import { findAllAdmins } from './app/helper/sendMailtoDamac'
// app.findAllAdmins = findAllAdmins;


// app.utility.mailchimp = require('./util/mailchimp')(config.mailchimpAPIkey);

app.get('/auth/userDetails', function (req, res) {
	res.json({ message: "success" });
});
app.get('/auth/user', function (req, res) {
	res.json({ message: "success" });
});

app.get('/test', function (req, res) {
	res.json({ message: 'success' })
})

app.get('/dashboard', function (req, res) {
	// console.log("work")
	res.sendFile(__dirname + '/public/vueDashboard/index.html');
})
app.get('*', function (req, res) {
	res.status(404);
	if (req.xhr) {
		res.status(404).json({
			message: 'endpoint not found'
		})
	} else {
		// res.status(200).json({ 'message' : 'error'});
		res.status(404).json('Error 404');

	}
});

global.asyncLogger = (logData, callback) => {
	app.db.models.Log.create(logData, (err, log) => {
		if (err) {
			console.log(err);
			callback('error	');
			return;
		}
		console.log("Log added")
		callback('working');

	})
};

app.set('trust proxy', function (ip) {
	if (ip === '127.0.0.1' || ip === '123.123.123.123') return true; // trusted IPs
	else return false;
});

// const socketio = require('./socketio.js');

// socketio.connectToSocket(client, app)
//app.listen(port);
server.listen(port);
 
// socketio.Socket(server, app);

//console.log('The magic happens on port ' + port);

// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		if (!fs.existsSync(__base + '/public/uploads/')) {
// 			fs.mkdirSync(__base + '/public/uploads/');
// 		}
// 		cb(null, __base + '/public/uploads/')
// 	}
// });


// const upload = multer({ storage: storage }).single('file');
//
// app.post('/image-upload', upload, (req, res, next) => {
// 	if (!req.file) {
// 		return res.status(400).json(getJsonRes('Something went wrong.'));
// 	}
// 	fs.rename(__base + '/public/uploads/' + req.file.filename, __base + '/public/uploads/' + req.file.filename + '.jpg', (err) => {
// 		if (err) {
// 			return res.status(400).json(getJsonRes('Something went wrong.'));
// 		}
// 		let image_data = {};
// 		image_data.url = "/uploads/" + req.file.filename + '.jpg';
// 		image_data.name = req.file.filename;
// 		res.send(image_data);
// 		imagemin(['public' + image_data.url], 'public/dist/uploads', {
// 			plugins: [
// 				imageminJpegtran({ progressive: true }),
// 				imageminJpegRecompress({
// 					loops: 4,
// 					min: 40,
// 					max: 95,
// 					quality: 'high'
// 				})
// 				// imageminJpegtran(),
// 				// imageminPngquant({quality: '65-80'})
// 			]
// 		}).then(files => {
// 		}).catch(err => {
// 			console.log(err)
// 		})
// 	});
// });

