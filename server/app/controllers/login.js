// Login page
module.exports.loginPage = function (req, res, next) {
	if(req.body.email){
		req.body.email = req.body.email.toLowerCase();
	}
	req.app.db.models.User.findOne({
		email: req.body.email
	}, function (err, user) {
		if (err) {
			winston.log(err);
			return res.status(400).json({
				user: req.JWTData,
				firstName: '',
				email: '',
				message: 'Something went wrong',
				
			});
		}
		if (!user) {
			return res.status(200).json({
				status: false,
				user: req.JWTData,
				firstName: '',
				email: '',
				message: 'Sorry, wrong email address or password',	
			});
		}
		if (user.validPassword(req.body.password)) {
			var payload = {
				id: user._id,
				userType: user.userType,
				email: user.email,
				username : user.username,
				permissions : user.permissions,
				created : Date.now()
			};
			var token = req.app.jwt.sign(payload, req.app.config.jwtSecret);
			res.cookie('token', token);
			res.json({
				user: req.JWTData,
				firstName: payload.firstName,
				email: payload.email,
				message: 'Success',
				permissions : user.permissions,
				token : token
			});

		} else {
			return res.status(200).json({
				status: false,
				user: req.JWTData,
				firstName: '',
				email: '',
				message: 'Sorry, wrong email address or password',
			
			});
		}
	});
};

module.exports.permissions = function (req, res, next) {
	res.json({ message : req.JWTData.permissions})
};



module.exports.logout = function (req, res, next) {
	res.json({ message : "successful"})
};