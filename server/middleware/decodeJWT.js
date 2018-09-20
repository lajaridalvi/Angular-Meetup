
module.exports.decodeToken = (req, res, next) => {
	var auth = req.get("authorization");
	if(!req.get("authorization")){
		res.json({ message : "You are not Authorized"});
		return;
	}
    auth = auth.split(" ");
    var decoded = req.app.jwt.decode(auth[1]);
	req.JWTData = decoded;
	// if(req.JWTData.created < Date.now() - 3600000*24){
	// 	res.status(401);
     //    res.json({ message : "You are not Authorized"});
     //    return;
	// }
	next(); 

};