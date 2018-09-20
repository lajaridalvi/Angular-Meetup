import { checkPermission } from '../middleware/permission'

module.exports = (app) => {
	
    app.get('/api/user', require(__base + '/app/controllers/user.js').viewUser);
	app.post('/register', require(__base + '/app/controllers/user.js').addUser);
	app.post('/login' ,require(__base + '/app/controllers/user.js').loginUser);
	
	app.post('/socialUserRegister' ,require(__base + '/app/controllers/user.js').socialRegisterUser);

	// To get OfferingAndSeeking
	app.get('/getOfferingAndSeeking' , require(__base + '/app/controllers/user.js').getOfferingAndSeeking);

	// To add OfferingAndSeeking
	app.post('/addOfferingAndSeeking' ,require(__base + '/app/controllers/user.js').addOfferingAndSeeking);
	
	// get user account details
	app.post('/api/user', require(__base + '/app/controllers/user.js').viewUser);
	
	// update user account details
	app.post('/api/updateUser', require(__base + '/app/controllers/user.js').updateUser);
	
	// get schedule only for the current user 
	app.post('/api/scheduleUser', require(__base + '/app/controllers/user.js').scheduleUser);
	
	// on schdule time click save the nav_schdule time into profile
	app.post('/api/schduleUserAvailability', require(__base + '/app/controllers/user.js').schduleUserAvailability);

	// add the offering / seeking in User
	app.post('/api/addToSeekingOrOffering', require(__base + '/app/controllers/user.js').addToSeekingOrOffering);
	
	// login / register social user
	app.post('/loginOrRegisterSocialUser', require(__base + '/app/controllers/user.js').loginOrRegisterSocialUser);

	//search user
	app.post('/api/searchByUser', require(__base + '/app/controllers/user.js').searchByUser);

	
};