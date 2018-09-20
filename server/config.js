'use strict';
var jsforce = require('jsforce');

exports.port = process.env.PORT || 3001;
exports.mongodb = {
	uri: 'mongodb://meetupLajari:lajari123@ds123532.mlab.com:23532/meetup-angular'
};

exports.authtoken = 'gweimwomwfen';

exports.jwtSecret = 'k3yb0ardc4t';
exports.companyName = 'Sanath';
exports.cryptoKey = 'k3yb0ardc4t';
exports.loginAttempts = {
	forIp: 50,
	forIpAndUser: 7,
	logExpiration: '20m'
};
exports.requireAccountVerification = false;
exports.mailchimpAPIkey = '';
exports.mandrillappAPIkey = '';
exports.winstonlogger = {
	token: '951c1bcf-31f8-48d3-906c-ab77099c8260',
	subdomain: 'main',
	tags: []
};

exports.mailDetails = {
	port: 465,
	host: 'email-smtp.eu-west-1.amazonaws.com',
	user: 'AKIAJGYLZCG4WOUQCA3Q',
	password: 'AvOqYovs1E7X0CcdSL1FBsGoiBX19NYVtHj9u83cwWMx'
};

exports.redisSocket = {
	parentDomain: 'http://localhost:8083', 	//Host Domain
	web_port: 3000,							//Port where app will be hosted
	admin_url: '/chatadmin',					//Choose a URL where admin panel can be accessed
	redis_port: 6379,							//Redis Port
	redis_hostname: "localhost", 				//Redis Hostname 
	admin_users: ['admin'], 					//Add usernames for different admins
	key: 'cGFzc3dvcmQ='						//Admin Password btoa hashed (Default = 'password')
};

exports.googleCred = {
clientID: '1065843915290-ksp522bon47r8tjn3omincg36oulmqq8.apps.googleusercontent.com',
clientSecret: '3uATaX1J7K3ut3Z0XkZqdnQm',
redirectUri: 'http://localhost:8080/web/events/1'
}

exports.linkedInCred = {
	clientID: '81oewr805hlcw7',
	clientSecret: 'y9U1OByHUPnnNbhP',
	redirectUri: 'http://localhost:8080/linkedin/oauth2callback'
}