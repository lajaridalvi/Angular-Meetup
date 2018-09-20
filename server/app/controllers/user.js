const moment = require('moment')
const mongoose = require('mongoose')
const isEmpty = require('../validation/is-empty')
const validateAddSeekingOrOffering = require('../validation/addToSeekingOrOffering')

debugger

module.exports.loginUser = (req,res) =>{
	console.log('req.body :', req.body);
	if(req.body.email == undefined || req.body.email == undefined){
		res.json({
			status : false,
			message :'your email and password are not correct' })
		return
	}

	const loginUser = {
		email : req.body.email,
		password : req.body.password
	}

	
	req.app.db.models.users.findOne({ email : req.body.email }, (err, data)=>{
		
		if(err){
			res.json({ status: false, message: "Database error" });
			return
		}
        if(!data){
            res.json({ status: false, message : "Email, you entered doesn't belong to meetup account" });
            return
        }
				
		req.app.bcrypt.compare(loginUser.password,data.password)
						.then(isMatched=>{
							if(isMatched){
								req.app.jwt.sign(data, req.app.config.jwtSecret, (err,token)=>{
									
									res.json({
										status : true,
										token : 'Bearer ' + token
									})
								})
							}else {
								res.json({
									status : false,
									message : 'Wrong password, please try again'
								})
							}
							
						}).catch(err=>{
							res.json({
								status : false,
								message : 'login failed, please login again'
							})
							
						})

	})
};


module.exports.addUser = (req, res) => {
	
	if (req.body.email) {
		req.body.email = req.body.email.toLowerCase();
	}

	
	let user = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: req.body.password,
		email: req.body.email,
		companyName: req.body.companyName,
		jobTitle: req.body.jobTitle,
	};

	
	if (!req.body.password || !req.body.email) {
		res.json({ status: false, message: "Please fill in all details" });
		return
	}

	
	req.app.db.models.users.findOne({ email: req.body.email }, function (err, data) {
		
		if (err) {
			res.json({ status: false, message: "Database error" });
			return
		}
		if (data) {
			res.json({
				status : false,
				message : "Email Address Already Registered"
			});
			return
		}
		
		console.log(data);
		req.app.db.models.users.create(user, (err, data) => {
			
			console.log('data :', data);
			if (err) {
				res.json({ status: false, message: "Database error", error : err.message });
				return
			}
			console.log('data :', data);

			req.app.bcrypt.compare(user.password,data.password)
						.then(isMatched=>{
							if(isMatched){
								req.app.jwt.sign(data, req.app.config.jwtSecret, (err,token)=>{
									
									return res.json({
										status : true,
										token : 'Bearer ' + token
									})
								})
							}else {
								return res.json({
									status : false,
									message : 'Wrong password, please try again'
								})
							}
							
						}).catch(err=>{
							return res.json({
								status : false,
								message : 'login failed, please login again'
							})
						})
		})
	});
};



module.exports.socialRegisterUser = (req,res)=>{
	const isSocialUser = true
	const userSocialId = req.body.userSocialId
	const email = req.body.email
	const firstName = req.body.firstName
	const lastName = req.body.lastName

	const user = {
		email , firstName, lastName , userSocialId , isSocialUser
	}
	console.log('user :', user);

	req.app.db.models.users.create(user , (data,error)=>{
		console.log('data :', data);
	})
}


module.exports.viewUser = (req, res) => {
	req.app.db.models.users.findById({_id : req.JWTData._doc._id})
			.select('email firstName lastName companyName jobTitle')
			.exec()
			.then(data=>res.json(data))
			.catch(err=>res.json({status : false , message : err.message}));
};


module.exports.editUser = (req, res) => {
	

	var data = {
        profileImage: req.body.profileImage,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        companyName: req.body.companyName,
        companyTitle: req.body.companyTitle,
        companyIndustry: req.body.companyIndustry,
        companySize: req.body.companySize,
        companyRevenue: req.body.companyRevenue
	}

    req.app.db.models.users.findByIdAndUpdate(req.JWTData._doc._id, data, function (err, user) {
        if (err) {
            res.json({ message: "error" });
            return
        }
        res.json(user);
    });
};


// To add (TODO : need to get it done at the Admin Level : CMS)	
module.exports.addOfferingAndSeeking = (req,res)=>{
	console.log('req.body :', req.body);

	const seekingArr = req.body
	//console.log('mongoose :', req.mongoose);

	seekingArr.map(s=>{
		s.details.map(d=>{
			d._id = mongoose.Types.ObjectId()
		})
	})

	
	seekingArr.map(s=>{
		req.app.db.models.offeringandseeking.create(s, (err, data)=>{
			if(err){
				res.json({ message: err.message });
			}
			console.log('data :', data);
		})
	})
}


module.exports.getOfferingAndSeeking = (req,res)=>{

	
	req.app.db.models.offeringandseeking.find().exec()
			.then(data=>res.json(data))
			.catch(err=>res.json({status: false, message : err.message}))
}

debugger
module.exports.updateUser = async (req,res) => {
	debugger
	const userId = req.JWTData._doc._id
	let email = req.body.email
	let firstName = req.body.firstName
	let lastName = req.body.lastName
	let companyName = req.body.companyName
	let jobTitle = req.body.jobTitle

	try{
		let seachedEmail = await req.app.db.models.users.findOne({email}).lean().exec()
		let data = await req.app.db.models.users.findOne({_id : userId}).lean().exec()

		if(seachedEmail){

			if(seachedEmail.email == data.email){
				if(!email) email = data.email
				if(!firstName) firstName = data.firstName
				if(!lastName) lastName = data.lastName
				if(!companyName) companyName = data.companyName
				if(!jobTitle) jobTitle = data.jobTitle
						

				let updatedData = await req.app.db.models.users.update({_id : userId}, { $set : { 
					'email' : email ,
					'firstName' : firstName ,
					'lastName' : lastName ,
					'companyName' : companyName ,
					'jobTitle' : jobTitle ,
					}})

				return res.json({status: true , userData : updatedData})	

			}else{
				return res.json({status: false , message : 'user already exists with this email, please enter someother email'})						
			}

		}else {

			if(!email) email = data.email
			if(!firstName) firstName = data.firstName
			if(!lastName) lastName = data.lastName
			if(!companyName) companyName = data.companyName
			if(!jobTitle) jobTitle = data.jobTitle
						

			let updatedData = await req.app.db.models.users.update({_id : userId}, { $set : { 
				'email' : email ,
				'firstName' : firstName ,
				'lastName' : lastName ,
				'companyName' : companyName ,
				'jobTitle' : jobTitle ,
				}})

				return res.json({status: true , userData : updatedData})	
		}

	}catch(err){
		return res.json({status : false , message : err.message})
	}
}

module.exports.scheduleUser = async (req,res) =>{
	// status => 
	// 0 => day
	// 1 => free for that time		
	// 2 => busy for that time		
	// 3 => busy with some other user

	

	//const userId = req.JWTData._doc._id
	const _id = req.body.profileId
	const duration = req.body.duration
	const startDate = req.body.startDate

	
	try{
		const Fprofile = await req.app.db.models.profiles.findOne({_id}).select('nav_schedule').exec()
		if(Fprofile){
			
			const nav_schedule = Fprofile.nav_schedule

			let currentDate = new Date(startDate)
			let startDateAt9 = startDate

			startDateAt9 = currentDate
			startDateAt9.setHours(9)
			startDateAt9.setMinutes(0)
			startDateAt9.setSeconds(0)
			startDateAt9.setMilliseconds(0)
			
			let MstartDateAt9 = moment(startDateAt9).format('X')
			const dayArry = []


			for(let i=0;i<duration;i++){
				let dayObj = {}
				
				dayObj.data = moment(MstartDateAt9,'X').add(i, 'days').format('dddd')
				dayObj.status = 0
				// push day
				dayArry.push(dayObj)
				

				for(let j=1;j<=36;j++){

					let addedvalue = 15* j + i * 24 * 60

					let dayObj = {}			
					dayObj.data = moment(MstartDateAt9,'X').add(addedvalue, 'minutes').format('X') 
					dayObj.status = 1
					
					dayArry.push(dayObj)
				}
			}
			
			if(nav_schedule.length > 0){
			dayArry.map(dayObj=>{
					nav_schedule.map(sch=>{
						if(dayObj.status === 1 && dayObj.data == sch){
							dayObj.status = 2
						}
					})
				
			})
				
			}

			res.json(dayArry)
		}else{
	
		}
	
	}catch(err){

	}
	

	//res.json({date,dateOne })
}




module.exports.schduleUserAvailability = async (req,res)=>{
	// status => 
	// 0 => day
	// 1 => free for that time		
	// 2 => busy for that time		
	// 3 => busy with some other user
	const schedule_status = req.body.schedule_status
	const nav_schedule_time = req.body.nav_schedule_time
	const profileId = req.body.profileId


	try{
		
		if(schedule_status == 1){
			const Fprofile = await req.app.db.models.profiles.findOneAndUpdate({_id : profileId}, { $addToSet : { "nav_schedule" : nav_schedule_time}}).exec()
			
			if(!Fprofile) return res.json({status : false , message : 'profile did not get updated'})

			else return res.json({status : true , message : 'time added to the schedule'})
		}else if(schedule_status == 2){

			const Fprofile = await req.app.db.models.profiles.findOneAndUpdate({_id : profileId}, { $pull: { "nav_schedule" : nav_schedule_time}}).exec()
			
			if(!Fprofile) return res.json({status : false , message : 'profile did not get updated'})

			else return res.json({status : true , message : 'time removed from the schedule'})
		}else{
			return res.json({status : false , message : 'invalid schedule_status'})
		}
		
		

	}catch(err){
		res.json({status : false , message : err.message})
	}
	


} 

module.exports.addToSeekingOrOffering = async (req,res)=>{
	// Seeking -> s
	// Offering -> o
	
	const { isValid , errors } = validateAddSeekingOrOffering(req.body)
    // check validation
    if(!isValid){
        return res.status(400).json({status : false , message : errors})
    }

	try{
		//const userId = req.JWTData._doc._id
		const code = req.body.code
		const profileId = req.body.profileId
		const eventKeys = req.body.eventKeys
		
		const Fprofile = await req.app.db.models.profiles.findOne({_id : profileId}).exec()
		
		if(code === 's'){
			Fprofile.seekings = eventKeys
		}else if(code === 'o'){
			Fprofile.offerings = eventKeys
		}
		const profile = await Fprofile.save()

		return res.json({status : true , message : 'added to the user preferences'})
	}catch(err){
		return res.json({status : true , message : err.message})
	}
}

module.exports.loginOrRegisterSocialUser = async (req,res)=>{
	
	const firstName = req.body.firstName
	const lastName = req.body.lastName
	const email = req.body.email
	const userSocialId = req.body.userSocialId
	const userSocialType = req.body.userSocialType


	if (req.body.email) {
		req.body.email = req.body.email.toLowerCase();
	}


	const Fuser = await req.app.db.models.users.findOne({email}).exec()
	
	// if user found 
	// 1. Login Social user
	if(Fuser){

		if(Fuser.userSocialId === userSocialId){
			const token = await req.app.jwt.sign(Fuser, req.app.config.jwtSecret)
			if(token) 
			return res.json({status : true, token : 'Bearer ' + token})
		}else 
			return res.json({status : false,message : 'Wrong password, please try again'})
	}
	// if user not found 
	// 1. Register Social user
	// 2. Login Social user
	else {
		
		const user = req.app.db.models.users({
			firstName,
			lastName,
			email,
			userSocialId,
			isSocialUser : true,
			userSocialType
		})

		const savedUser = await user.save()

		if(savedUser) {
			// the below condition is not required but still use it to make sure everything is checked properly
			if(savedUser.userSocialId === userSocialId){
				const token = await req.app.jwt.sign(savedUser, req.app.config.jwtSecret)
				if(token) 
				return res.json({status : true, token : 'Bearer ' + token})
			}else 
				return res.json({status : false,message : 'Wrong password, please try again'})
	
		}else 
			return res.json({status : false,message : 'Error occured while registering user'})
	}
	
}
debugger
module.exports.searchByUser = async (req,res)=>{
	
	const eventId = req.body.eventId
	const searchString = req.body.searchString
	const profileId = req.body.profileId

	try{
		
		let U_profile = await req.app.db.models.profiles.findOne({_id : profileId})
		const userId = U_profile.user
		let All_profiles = await req.app.db.models.profiles.aggregate(
				{$unwind:'$user'},
				{$match: {'event' :  mongoose.Types.ObjectId(eventId)  }},
				{$lookup:{
					from: 'users',
					localField: 'user',
					foreignField: '_id',
					as: 'user',
					}},
				
				{$match: /*{$and : [ */
					//{'event' :  [mongoose.Types.ObjectId('5b41d3f21c79bf0408b1c816')]  },
					{ $or : [
						{'user.firstName':{ '$regex': searchString, '$options': 'i' }},
						{'user.lastName':{ '$regex': searchString, '$options': 'i' }},
						{'user.companyName':{ '$regex': searchString, '$options': 'i' }},
						{'user.jobTitle':{ '$regex': searchString, '$options': 'i' }},
						{'user.email':{ '$regex': searchString, '$options': 'i' }},
					]}
			//]}
				},
				//{$group: {_id: '$_id', firstName: {$first: '$user.firstName'}}},
				{$limit: 20},
				//{$skip : 1}
			)
			All_profiles = All_profiles.map(userProfile=>{
					if(userProfile.user.length > 0){
						userProfile.user = userProfile.user[0]

						let  all_meetings = [] , meeting = []
				
					if(userProfile.user_meetings.length > 0){
						meeting = userProfile.user_meetings.map(u=>{
							
							return u.meetingUser_P_Id
						})
						all_meetings = all_meetings.concat(meeting)
						meeting = []
					}
					if(userProfile.user_pending_meetings.length > 0){
						meeting = userProfile.user_pending_meetings.map(u=>{
							return u.meetingUser_P_Id
						})
						all_meetings = all_meetings.concat(meeting)
						meeting = []
					}
					if(userProfile.others_pending_meetings.length > 0){
						meeting = userProfile.others_pending_meetings.map(u=>{
							return u.meetingUser_P_Id
						})
						all_meetings = all_meetings.concat(meeting)
						meeting = []
					}
					
					

					if(all_meetings){
						userProfile.isAvailableForChat = all_meetings.some(a=> JSON.stringify(a) === JSON.stringify(userId))
					}else{
						userProfile.isAvailableForChat = false
					}

					userProfile.isBookmarked = U_profile.usersBookmarked.some(b =>JSON.stringify(b) === JSON.stringify(userProfile._id))
					debugger

					let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
					userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();
					return userProfile


				}
			})
		res.json(All_profiles)
	}catch(err){return res.json({status : false , message : err.message})}

}
