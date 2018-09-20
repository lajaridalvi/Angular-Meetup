import { checkPermission } from '../middleware/permission'
import fs from 'fs'
import multer from 'multer'

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, __base + '/public/brochure')
	}
});

let upload = multer({ //multer settings
	storage: storage
}).single('file');

let duplicateFileCheck = (req, res, next) => {
	let fileCheck = fs.existsSync(`${__base}/public/brochure/${req.file.originalname}`)
	if (fileCheck) {
		fs.unlink(`${__base}/public/brochure/${req.file.filename}`, (err, result) => {
			return res.json({ status: false, message: "Duplicate file name" })
		});
	}
	else {
		next();
	}
}

module.exports = (app) => {
	app.post('/uploadfile', upload, duplicateFileCheck, require(__base + '/app/controllers/uploadFile').uploadFile);
	app.get('/brochurelinks', require(__base + '/app/controllers/uploadFile').brochureLinks);
};

