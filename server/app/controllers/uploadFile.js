import fs from 'fs'
export const uploadFile = (req, res) => {
	if (!fs.existsSync(__base + '/public/brochure/')) {
		fs.mkdirSync(__base + '/public/brochure/');
	}
	let fileformat = req.file.originalname;
	if (!req.file) {
		console.log('error');
		return res.json({ status: false, message: 'please upload a file' })
	}
	else {
		fs.rename(__base + '/public/brochure/' + req.file.filename, __base + '/public/brochure/' + req.file.originalname, function (err) {
			if (err) {
				throw err;
			}
			else {
				console.log("File uploaded successfully");
				let fileData = {
					fileUrl: `http://${req.headers.host}/brochure/${req.file.originalname}`
				}
				return res.json({ status: true, file: fileData, message: " file uploaded successfully" })
			}
		});
	}
}

export const brochureLinks = (req, res) => {
	fs.readdir(`${__base}/public/brochure/`, (err, files) => {
		 let fileArray = []
		 files.map((x)=>{
			 fileArray.push({name : x ,value : `http://${req.headers.host}/brochure/${x}`});
		 })
		 res.status(200).json({status:true , fileUrlArray : fileArray , message:"success"})
	})
}