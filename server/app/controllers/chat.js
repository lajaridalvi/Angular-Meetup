module.exports.viewChat = (req,res) => {
    req.app.db.models.chats.find({
    	$and : [{sender : req.JWTData._doc._id},{receiver : req.body.receiverId } ] }, (err, data)=> {
		if(data){
            res.json({ message : 'success', data : data})
        }
    });
};