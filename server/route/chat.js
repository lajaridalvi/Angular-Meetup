import { checkPermission } from '../middleware/permission'
const chatS = require('../schema/Chat')
module.exports = (app) => {
	
    app.post('/api/chatrecords', require(__base + '/app/controllers/chat.js').viewChat);
    

	 
};