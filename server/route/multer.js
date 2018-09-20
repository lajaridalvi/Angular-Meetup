const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (!fs.existsSync(__base + '/public/uploads/')) {
			fs.mkdirSync(__base + '/public/uploads/');
		}
		cb(null, __base + '/public/uploads/');
	}
});

const uploadfile = multer({ storage: storage }).single('profileImage');

module.exports = (app) => {
  app.post('/uploadfile', uploadfile, require(__base + '/app/controllers/home').uploadfile);
}