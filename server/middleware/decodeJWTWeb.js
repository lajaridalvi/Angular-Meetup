
module.exports.decodeToken = (req, res, next) => {

	var auth = req.body.token;
	if(!auth){
		res.json({ message : "You are not Authorized"});
		return;
	}
	
    var decoded = req.app.jwt.decode(auth);
	req.JWTData = decoded;
	
	next();
};