const validateSendingRequestForMeeting = require('../validation/sendMeetingRequest')
const moment = require('moment')


module.exports.sendMeetingRequest = async (req,res) => {
    debugger
    const { isValid , errors } = validateSendingRequestForMeeting(req.body)
    // check validation
    if(!isValid){
        return res.status(400).json({status : false , message : errors})
    }

    
    const timeSlot = req.body.timeSlot 
    const O_profileId = req.body.O_profileId
    const U_profileId = req.body.U_profileId
    const message = req.body.message

    
    try{
        const Oprofile = await req.app.db.models.profiles.findOne({_id : O_profileId}).lean().exec()
        const Uprofile = await req.app.db.models.profiles.findOne({_id : U_profileId}).lean().exec()

        if(Oprofile && Uprofile){
            
            // insert send's userId inside others_pending_meetings of others / receviers profile object 
            if(Oprofile.others_pending_meetings !== undefined ) {
                
                // add this to the receiver's profile
                const others_pending_meetings = {
                    timeSlot,
                    meetingUser_P_Id : Uprofile.user,
                    message
                }
                // add this to the sender's profile
                const user_pending_meetings = {
                    timeSlot,
                    meetingUser_P_Id : Oprofile.user,
                    message
                }
                // before adding check if its already present in the user_meetings array of both 
                if(Oprofile.user_meetings.length > 0 && Uprofile.user_meetings.length > 0){
                    const O_isPresent =  Oprofile.user_meetings.some(opm=> JSON.stringify(opm.meetingUser_P_Id)  == JSON.stringify(Uprofile.user))
                    const U_isPresent =  Uprofile.user_meetings.some(upm=> JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(Oprofile.user))
                    if(U_isPresent || O_isPresent) return res.json({status : false , message : 'both users are already set for a meeting'})
                }

                if(Oprofile.others_pending_meetings.length > 0 && Uprofile.user_pending_meetings.length > 0){
                    const O_isPresent =  Oprofile.others_pending_meetings.some(opm=> JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(Uprofile.user))
                    const U_isPresent =  Uprofile.user_pending_meetings.some(upm=> JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(Oprofile.user))
                    
                    if(!O_isPresent && !U_isPresent){
                        // perform insertion operation
                        await req.app.db.models.profiles.update(
                            {_id : O_profileId},  
                            { $addToSet : {others_pending_meetings }} )
    
                        await req.app.db.models.profiles.update(
                            {_id : U_profileId},  
                            { $addToSet : {user_pending_meetings }} )                        
                        
                        return res.json({status : true , message : 'succesully sent the meeting request'})                
                        
                    }else {
                        // do not perform updation, handle this on the user list page 
                        //(make sure to disable it for this route and redirect to the chat window )
                        return res.json({status: false , message : 'already sent the meeting request'})    
                    }
                
                
                }else {
                    // just insert it as the first item of an array
                    // perform insertion operation
                    await req.app.db.models.profiles.update(
                        {_id : O_profileId},  
                        { $addToSet : {others_pending_meetings }} )

                    await req.app.db.models.profiles.update(
                        {_id : U_profileId},  
                        { $addToSet : {user_pending_meetings }} )                        
                    
                    return res.json({status : true , message : 'successfully sent the meeting request'})                
                }
                
            }else return res.json({status : false , message : 'receiver\'s profile does not contains meeting module'})                
        }else {
            return res.json({status : false , message : 'receiver\'s / sender\'s profile not found'})
        }
        

    }catch(err){return res.json({status : false , message : err.message})}
    
    

}

module.exports.acceptOrRejectMeetingRequest = async (req,res) => {
    
    debugger
    const O_userId = req.body.O_userId
    const eventId = req.body.eventId
    const U_userId = req.body.U_userId

    const a_r_code = req.body.a_r_code


    try{
        const Oprofile = await req.app.db.models.profiles.findOne({ $and : [{event : eventId},{user : O_userId}]}).exec()
        const Uprofile = await req.app.db.models.profiles.findOne({ $and : [{event : eventId},{user : U_userId}]}).exec()

        
        
        if(Oprofile && Uprofile){
            // insert send's userId inside others_pending_meetings of others / receviers profile object 
            if(Oprofile.others_pending_meetings !== undefined ) {
                
                // before adding check if its already present in the user_meetings array of both 
                if(Oprofile.user_meetings.length > 0 && Uprofile.user_meetings.length > 0){
                    const O_isPresent =  Oprofile.user_meetings.some(opm=> JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(Uprofile.user))
                    const U_isPresent =  Uprofile.user_meetings.some(upm=> JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(Oprofile.user))
                    if(U_isPresent || O_isPresent) return res.json({status : false , message : 'both users are already set for a meeting'})
                }
                // find the U-> o_pending_meeting array and O-> u_pending_meeting array
                if(Oprofile.user_pending_meetings.length > 0 && Uprofile.others_pending_meetings.length > 0){
                    const O_isPresent =  Oprofile.user_pending_meetings.filter(opm=> JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(Uprofile.user) ? opm : null)[0]
                    const U_isPresent =  Uprofile.others_pending_meetings.filter(upm=> JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(Oprofile.user) ? upm : null)[0]


                    if(O_isPresent && U_isPresent ){

                        // removing the objects from the pending arrays 
                        Oprofile.user_pending_meetings.splice(
                            Oprofile.user_pending_meetings.findIndex(opm=> JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(Uprofile.user)),1)
                        Uprofile.others_pending_meetings.splice(
                            Uprofile.others_pending_meetings.findIndex(upm=> JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(Oprofile.user)),1)


                        //adding the arrays to the meeting arrays
                        if(a_r_code === 'a'){
                            Uprofile.user_meetings.push(U_isPresent)
                            Oprofile.user_meetings.push(O_isPresent)

                            await Uprofile.save()
                            await Oprofile.save()

                            return res.json({status : true , message : 'successfully add to the meetings'})                
                        }
                        //not adding the arrays to the cancelled meeting arrays as, the user don'nt dont want to see declined request 
                        else if(a_r_code === 'r'){
                            // request declined hence, just cleaned up the pending arrays 
                            await Uprofile.save()
                            await Oprofile.save()
                            return res.json({status : true , message : 'successfully declined for the meeting'})                
                        }
                    }

                }else return res.json({status : false , message : 'receiver\'s / sender\'s profile meeting array is empty'})

                
            
            
            }
            else return res.json({status : false , message : 'receiver\'s / sender\'s profile does not contains meeting module'})                
        }else return res.json({status : false , message : 'receiver\'s / sender\'s profile not found'})
        

    }catch(err){
        return res.json({status : false , message : err.message})
    }

}

module.exports.scheduleUserMeeting = async (req,res) =>{
    // status => 
	// 0 => day
	// 1 => free for that time		
	// 2 => busy for that time		    // 3 => busy with some other user
    debugger
    
    const profile_U_Id = req.body.profile_U_Id
    const profile_R_Id = req.body.profile_R_Id
	const duration = req.body.duration
	const startDate = req.body.startDate

	
	try{
		const Uprofile = await req.app.db.models.profiles.findOne({_id : profile_U_Id}).exec()
        const Rprofile = await req.app.db.models.profiles.findOne({_id : profile_R_Id}).exec()

        // let U_timeSlopt = Uprofile.user_meetings.filter(m=> {return m.timeSlot})
        // let R_timeSlopt = Rprofile.user_meetings.filter(m=> {return m.timeSlot})
        let all_M_timeslots = []
        
        Uprofile.user_meetings.map(u=>{
            all_M_timeslots.push(u.timeSlot)
        })

        Rprofile.user_meetings.map(u=>{
            all_M_timeslots.push(u.timeSlot)
        })


		if(Uprofile){
			
			const nav_schedule = Uprofile.nav_schedule
            
			let currentDate = new Date(startDate)
            let startDateAt9 = startDate
            
            // startDate.getHours()
            // startDate.getMinutes()
            // startDate.getSeconds()

			startDateAt9 = currentDate
			startDateAt9.setHours(9)
			startDateAt9.setMinutes(0)
			startDateAt9.setSeconds(0)
			startDateAt9.setMilliseconds(0)
			
			let MstartDateAt9 = moment(startDateAt9).format('X')
			const dayArry = []


			for(let i=0;i<duration;i++){
				let dayObj = {}
                
                //let updatedDate = moment(MstartDateAt9,'X').add(i, 'days')
                
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

                        
						if (dayObj.status === 1 && dayObj.data == sch){
                            dayObj.status = 2
                        }

                        if (dayObj.status === 1){
                            all_M_timeslots.map(all=>{
                                if(all == dayObj.data) dayObj.status = 3
                            })
                        }
                        
					})
				
			})
				
			}

			res.json(dayArry)
		}else{
	
		}
	
	}catch(err){
        return res.json({status : false , message : err.message})   
	}
}

module.exports.userMeetings = async (req,res) =>{
    debugger
    const userId = req.JWTData._doc._id
    console.log('userId :', userId);
    try{
        let user = await req.app.db.models.users.findOne({_id : userId}).lean().select('profile')
        .populate('profile',['event','others_pending_meetings','user_meetings'])
        
        user = await req.app.db.models.events.populate(user, {
            path: 'profile.event',
            select : ['eventTitle'],
            model : req.app.db.models.events,
        })  
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.others_pending_meetings.meetingUser_P_Id',
            select : ['firstName','lastName','email','companyName','jobTitle'],
            model : req.app.db.models.users
        }) 
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.user_meetings.meetingUser_P_Id',
            select : ['firstName','lastName','email','companyName','jobTitle'],
            model : req.app.db.models.users
        }) 

        //return res.json(user)        

        let data = {}
        
        data.eventPendings = []
        data.eventMeeting = []


        user.profile.map(p=>{
            debugger
            let eventP = {}
            let eventM = {}
            
            eventP.eventName = p.event.eventTitle
            eventP.eventId = p.event._id
            eventP.P_meeting = []
            if(p.others_pending_meetings.length > 0){
                p.others_pending_meetings.map(opm => {
                    opm.displayTime = moment(opm.timeSlot, 'X').format('dddd • h:mm a') + ' - ' + moment(opm.timeSlot, 'X').add(15, 'minutes').format('h:mm a')
                    eventP.P_meeting.push(opm)
                })
                data.eventPendings.push(eventP)
            }

            eventM.eventName = p.event.eventTitle
            eventM.eventId = p.event._id
            eventM.U_meeting = []

            if(p.user_meetings.length > 0){

                p.user_meetings.map(um => {
                    um.displayTime = moment(um.timeSlot, 'X').format('dddd • h:mm a') + ' - ' + moment(um.timeSlot, 'X').add(15, 'minutes').format('h:mm a')
                    eventM.U_meeting.push(um)
                })
                data.eventMeeting.push(eventM)
            }
        })

        return res.json({status : true , profiles : data})
    }catch(err){return res.json({status : false, message : err.message})}
    
}  

module.exports.userCancelledMeetings = async (req,res) => {

    const userId = req.JWTData._doc._id
    try{
        let user = await req.app.db.models.users.findOne({_id : userId}).lean().select('profile').populate('profile',['event','user_cancelled_meetings'])
        user = await req.app.db.models.events.populate(user, {
            path: 'profile.event',
            select : ['eventTitle'],
            model : req.app.db.models.events,
        })  
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.user_cancelled_meetings.meetingUser_P_Id',
            select : ['firstName','lastName','email','companyName','jobTitle'],
            model : req.app.db.models.users
        }) 
        

        let data = {}
        
        data.eventCancelled = []
        user.profile.map(p=>{
            let eventC = {}
            
            eventC.eventName = p.event.eventTitle
            eventC.eventId = p.event._id
            eventC.P_meeting = []
            if(p.user_cancelled_meetings.length > 0){
                p.user_cancelled_meetings.map(opm => {
                    opm.displayTime = moment(opm.timeSlot, 'X').format('dddd • h:mm a') + ' - ' + moment(opm.timeSlot, 'X').add(15, 'minutes').format('h:mm a')
                    eventC.P_meeting.push(opm)
                })
                data.eventCancelled.push(eventC)
            }
        })
        return res.json({status : true , profiles : data})
    }catch(err){return res.json({status : false, message : err.message})}

}

module.exports.userPendingMeetings = async (req,res) => {
    debugger
    const userId = req.JWTData._doc._id
    try{
        let user = await req.app.db.models.users.findOne({_id : userId}).lean().select('profile').populate('profile',['event','user_pending_meetings'])
        user = await req.app.db.models.events.populate(user, {
            path: 'profile.event',
            select : ['eventTitle'],
            model : req.app.db.models.events,
        })  
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.user_pending_meetings.meetingUser_P_Id',
            select : ['firstName','lastName','email','companyName','jobTitle'],
            model : req.app.db.models.users
        }) 
        

        let data = {}
        
        data.eventPendings = []
        user.profile.map(p=>{
            debugger
            let eventP = {}
            
            eventP.eventName = p.event.eventTitle
            eventP.eventId = p.event._id
            eventP.U_meeting = []
            if(p.user_pending_meetings.length > 0){
                debugger    
                p.user_pending_meetings.map(um => {
                    debugger
                    um.displayTime = moment(um.timeSlot, 'X').format('dddd • h:mm a') + ' - ' + moment(um.timeSlot, 'X').add(15, 'minutes').format('h:mm a')
                    eventP.U_meeting.push(um)
                })
                data.eventPendings.push(eventP)
            }
            
        })

        return res.json({status : true , profiles : data})
    }catch(err){return res.json({status : false, message : err.message})}

}