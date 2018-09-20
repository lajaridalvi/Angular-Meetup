const validateAddEvent = require('../validation/addEvent')
const isEmpty = require('../validation/is-empty')
const moment = require('moment')


module.exports.addEvents = async (req, res)=>{
    
    const { isValid , errors } = validateAddEvent(req.body)
    // check validation
    if(!isValid){
        return res.status(400).json({status : false , message : errors})
    }

    const admin = req.JWTData._doc._id
    const eventTitle = req.body.eventTitle
    const eventDesc = req.body.eventDesc
    const eventCode = req.body.eventCode
    const userPitch = !req.body.pitch ? 'Hey there, I m looking for new connections' : req.body.pitch
    const startDate = new Date()/*req.body.startDate*/   
    const duration = req.body.duration 
    const usersProfiles = []

    try{

        const Fevent = await req.app.db.models.events.findOne({eventCode}).exec()

    // find for the event 
    if(Fevent) return res.json({status : false , messsge : 'event already exists with same eventCode'})
    // else create a new event
    else {
        
        // create an event
        const event =  new req.app.db.models.events({ admin , eventTitle , eventDesc , eventCode ,startDate , duration})
        // saving the newly created event object 
        const createdEvent = await event.save()

        // create a profile
        const profile = new req.app.db.models.profiles({user : admin ,event : createdEvent._id ,pitch : userPitch})
        const createdProfle = await profile.save()

        // pushing the newly create profile id to the event object 
        const updatedEvent = await req.app.db.models.events.update({_id : createdEvent._id}, 
            { "$addToSet" : { usersProfiles : createdProfle._id}}).exec()
        
        const updateUser = await req.app.db.models.users.update({_id : admin}, 
            { "$addToSet" : { profile : createdProfle._id}}).exec()
        
        if(updatedEvent) return res.json({status : true , message : 'Event created successfully'})
    }

    }catch(err){
        return res.json({status : false , message : err.message})
    }

};
 
module.exports.getEvents = async (req, res) => {
    
    const userId = req.JWTData._doc._id
    const page = req.body.page
    
    
    if(!userId) return res.json({status : false , message : 'provide token'})
    
    try{

        
        const events = await req.app.db.models.profiles.paginate({user : userId},{ page, limit: 2, lean : true, select : ['event','user','pitch','offerings','seekings'], 
        populate : 
            [{
                path: 'event',
                select : ['eventTitle','eventDesc','eventCode','startDate','duration','eventBanner'],
                model : req.app.db.models.events
            }]   
        })

        
        
        events.events = events.docs
        events.docs = undefined
        events.status = true
        return res.json(events)

    }catch(err){
        return res.json({status : false , message : err.message})   
    }
    
};

module.exports.getAllEventsUsers = (req, res) =>{
    const userId = req.JWTData._doc._id
    const eventCode = req.body.eventCode
    req.app.db.models.events.findOne({eventCode})
                .populate('users')
                .exec()
                .then(data=>res.json(data.users))
                .catch(err=>res.json({status : false , message : err.message}))
}


module.exports.getAllNewestUsers = async (req,res) => {
    debugger
    
    const eventCode = req.body.eventCode
    const profileId = req.body.profileId
    const page = req.body.page
    
    if(!eventCode) return res.json({status : false , message : { eventCode : 'provide eventCode'}})
    if(!profileId) return res.json({status : false , message : { profileId : 'provide profileId'}})

    
    try{
    let U_profile = await req.app.db.models.profiles.findOne({_id : profileId})
    let allProfiles = await req.app.db.models.profiles.paginate({event : eventCode},{ page, limit: 6, sort: { pitchUpdatedAt: -1 }, lean : true,
        populate : {
            path: 'user',
            select : ['firstName','lastName','email','companyName','jobTitle'],
            model : req.app.db.models.users,
            }})
          
    allProfiles.docs = allProfiles.docs.map(userProfile=>{
            debugger
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
                userProfile.isAvailableForChat = all_meetings.some(a=> {
                    debugger
                    return JSON.stringify(a) === JSON.stringify(U_profile.user)
                })
            }else{
                userProfile.isAvailableForChat = false
            }

            userProfile.isBookmarked = U_profile.usersBookmarked.some(b =>JSON.stringify(b) === JSON.stringify(userProfile._id))
            debugger

            let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
            userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();
            return userProfile
        })                                                             
        allProfiles.status = true
        allProfiles.profile = allProfiles.docs
        allProfiles.docs = undefined
        return res.json(allProfiles)    
    } catch(err) {res.json({status : false , message : err.message})}
}

debugger

module.exports.joinEvents = async (req, res) => {
    
    const userId = req.JWTData._doc._id
    const eventCode = req.body.eventCode

    if(!eventCode) return res.json({status : false , message : { eventCode : 'provide eventCode'}})

    const pitch = !req.body.pitch ? 'Hey there, I m looking for new connections' : req.body.pitch
    try {
        
        // Push Insert and Update of Profile Id  
        const Fevent = await req.app.db.models.events.findOne({ eventCode  }).exec()
        const Fprofile = await req.app.db.models.profiles.findOne({ $and: [ { event: Fevent._id }, { user: userId } ] }).exec()
        
        if(Fprofile){
            
            const updatedPro = await req.app.db.models.profiles.findOneAndUpdate({_id : Fprofile._id},
                 {"pitch" : pitch, "pitchUpdatedAt" : new Date()}).exec()
            
            const Fuser = await req.app.db.models.users.findOneAndUpdate({_id :userId}, { "$addToSet" : { profile : Fprofile._id}})
                                                        .exec()

            const Fevent = await req.app.db.models.events.findOneAndUpdate({eventCode}, { "$addToSet" : { usersProfiles : Fprofile._id}})
                                                         .exec()
            return res.json({status : true, 
                eventId : Fevent._id, 
                eventCode : Fevent.eventCode, 
                profileId : updatedPro._id, 
                eventTitle : Fevent.eventTitle,
                offerings : updatedPro.offerings,
                seekings : updatedPro.seekings,
                startDate : Fevent.startDate,
                duration : Fevent.duration,
                pitch : updatedPro.pitch
            })

        }else {

            
            const profile = new req.app.db.models.profiles({
                user : userId,
                event : Fevent._id,
                pitch
            })

            const savedProfile = await profile.save()

            if(savedProfile){
                const Fevent = await req.app.db.models.events.findOneAndUpdate({eventCode}, { "$addToSet" : { usersProfiles : savedProfile._id}})
                                                         .exec()
                const Fuser = await req.app.db.models.users.findOneAndUpdate({_id : userId}, { "$addToSet" : { profile : savedProfile._id}}).exec()
                return res.json({status : true , 
                    eventId : Fevent._id, 
                    eventCode : Fevent.eventCode, 
                    profileId : savedProfile._id, 
                    eventTitle : Fevent.eventTitle,
                    offerings : savedProfile.offerings,
                    seekings : savedProfile.seekings,
                    startDate : Fevent.startDate,
                    duration : Fevent.duration,
                    pitch : savedProfile.pitch
                })
            }
            
        }
    }catch(err){
        return res.json({status : false , message : err.message})   
    }
    

};

debugger
module.exports.getPublicEvent = (req,res) => {
    console.log('req.body.eventcode :', req.body.eventCode);
    const eventCode = req.body.eventCode

    req.app.db.models.events.findOne({eventCode}).exec()
        .then(data=>{
            console.log('data :', data);
            if(data){
                res.json({status : true , data})
            }else {
                res.json({status : false , message : 'Event not found, please try again'})
            }
            
        })
        .catch(err=>res.json({status : false , message : err.message}))
}


module.exports.addEventKeys = async (req,res) =>{
    const userId = req.JWTData._doc._id
    const eventId = req.body.eventId;
    const eventData = req.body
    try{
        
        //const Fevent = await req.app.db.models.events.findOne({ $and: [ { _id: eventId }, { admin: userId } ] }).exec()
        const Fevent = await req.app.db.models.events.findOne({ _id : eventId }).exec()
        
        if(!Fevent) return res.json({status : false , message : 'No such event/admin found'})

        const FeventKeys = await req.app.db.models.eventKeys.findOneAndUpdate({eventId}, { $set: eventData}, { 'new': true}).exec()

        if(FeventKeys) {
            
            // just update
            Fevent.eventKeys = FeventKeys._id
        }else {

            // create new 
            const data = new req.app.db.models.eventKeys(eventData)
            const savedKeysObj = await data.save()
            Fevent.eventKeys = savedKeysObj._id
        }
        const savedEvent = await Fevent.save()
        res.json({status : true , message : 'Event keys added successfully'})
    }catch(err){
        return res.json({status : false , message : err.message})
    }
    
}

module.exports.getEventKeys = async (req,res)=>{
    
    const eventId = req.body.eventId
    const profileId = req.body.profileId
    const code = req.body.code

    if(isEmpty(eventId) || isEmpty(profileId)){
        return res.json({status : false , message : 'eventId and profileId are required'})
    }

    

    try{
        const Fprofile = await req.app.db.models.profiles.findOne({ _id : profileId }).lean().exec()
 
        let userPrefs = []
        
        if(code === 'o') userPrefs = Fprofile.offerings
        else if (code === 's') userPrefs = Fprofile.seekings
        

        const FeventKeys = await req.app.db.models.eventKeys.findOne({ eventId }).lean().exec()
        if(FeventKeys){
            if(userPrefs.length === 0){

            }

            let data = FeventKeys
            
            
            data.eventData.map(e=>{
                
                let arr = []
                e.details.map(k=>{
                    
                    let d = {}
                    if(userPrefs.length === 0){
                        d.key = k
                        d.status = false
                    }else{
                        userPrefs.map(up=>{
                            d.key = k
                            if(!d.status){
                                if(k === up) d.status = true
                                else d.status = false
                            }
                        })
                    }
                    arr.push(d)
                })
                e.data = arr
                e.details = undefined
            })
            
            console.log('data :', data);

            return res.json({status : true , eventKeys : data})
        }
        else res.json({status : false , message : 'No Event Keys found for this event, add your keys to display'})
    }catch(err){
        return res.json({status : false , message : err.mesage});
    }
}


module.exports.getAllMatchedUsers = async (req,res) =>{
    debugger
     //const userId = req.JWTData._doc._id
    const eventId = req.body.eventCode
    const profileId = req.body.profileId
    const page = req.body.page

    if(!eventId) return res.json({status : false , message : { eventId : 'provide eventCode'}})
    if(!profileId) return res.json({status : false , message : { profileId : 'provide profileId'}})
    
    try{
    let U_user = await req.app.db.models.profiles.findOne({_id : profileId}).exec()         
    const userS = U_user.seekings
    const userO = U_user.offerings

    let U_profile = await req.app.db.models.profiles.findOne({_id : profileId})
    let allProfiles = await req.app.db.models.profiles.paginate({event : eventId},{ page, limit: 6, lean : true, 
        populate : {
            path: 'user',
            select : ['firstName','lastName','email','companyName','jobTitle'],
            model : req.app.db.models.users,
            }
    })


    //allProfiles
    
    
    allProfiles.docs = allProfiles.docs.map(userProfile=>{
        debugger
        let  all_meetings = [],  meeting = []
        
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
            userProfile.isAvailableForChat = all_meetings.some(a=> {
                debugger
                return JSON.stringify(a) === JSON.stringify(U_profile.user)
            })
        }else{
            userProfile.isAvailableForChat = false
        }
        userProfile.isBookmarked = U_profile.usersBookmarked.some(b =>JSON.stringify(b) === JSON.stringify(userProfile._id))
        

        // for matches
        let aU_seekings = userProfile.seekings
        let aU_offerings = userProfile.offerings
        let countS = 0
        let countO = 0
        if(aU_offerings.length > 0 && userS.length > 0){

            // userS.some(u=>{
                
            //     if(typeof aU_seekings.filter(aU => aU === u)[0] === 'string') ++countS 
            // })
            
            
            // In case if the above three lines does'nt perform
            userS.map(u=>{
                aU_offerings.map(aU=>{
                    
                    if(aU === u){
                        ++countS;
                    }
                })
            })
        }
        

        if(aU_seekings.length > 0 && userO.length > 0){

            // userO.some(u=>{
            //     if(typeof aU_offerings.filter(aU => aU === u)[0] === 'string') ++countO 
            // })
            
            // In case if the above three lines does'nt perform
            userO.map(u=>{
                aU_seekings.map(aU=>{
                    if(aU === u){
                        
                        ++countO;
                    }
                })
            })
        }

        userProfile.seekingCount = countS
        userProfile.offeringCount = countO
        userProfile.topMatch = countS + countO > 3 ? true : false
        let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
        userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();

        return userProfile

    })                                                             
    allProfiles.status = true
    allProfiles.profile = allProfiles.docs
    allProfiles.docs = undefined
    return res.json(allProfiles)        
                                        
    } catch(err) {res.json({status : false , message : err.message})}
}

module.exports.viewallPartners = async (req, res) => {
    const eventId = req.body.eventCode
    const event = await req.app.db.models.events.findOne({ _id: eventId }).populate('partner').select('partner').exec()
    res.json(event.partner)
}


module.exports.getEventInfo = async (req,res)=>{
    const eventId = req.body.eventCode

    try{
    
        const event = await req.app.db.models.events.findOne({ _id: eventId }).exec()

        if(event)
            return res.json({status : true , event})               
        else
            return res.json({status : false , event})               
    
    }
    catch(err){return res.json({status : false , message : err.message})}
    
}


module.exports.filterByEventKey = async (req,res) =>{
    
    const code = req.body.code
    const eventId = req.body.eventId
    const eventKey = req.body.eventKey
    const profileId = req.body.profileId
    const page = req.body.page
    
    let q2 = {}
    const q1 = { event : eventId }

    if(code === 'o') q2 = { offerings : { $in : [eventKey] }}
    else if(code === 's') q2 = { seekings : { $in : [eventKey] } }

    const query = {$and : [q1,q2]}
    

    if(!eventId) return res.json({status : false , message : { eventId : 'provide eventCode'}})
    if(!profileId) return res.json({status : false , message : { profileId : 'provide profileId'}})
    
    try{
    let U_user = await req.app.db.models.profiles.findOne({_id : profileId}).exec()         
    const userS = U_user.seekings
    const userO = U_user.offerings

    let U_profile = await req.app.db.models.profiles.findOne({_id : profileId})
    const userId = U_profile.user 
    let allProfiles = await req.app.db.models.profiles.paginate(query,{ page, limit: 6, lean : true, 
        populate : {
            path: 'user',
            select : ['firstName','lastName','email','companyName','jobTitle'],
            model : req.app.db.models.users,
            }
    })
    
    allProfiles.docs = allProfiles.docs.map(userProfile=>{
        
        let  all_meetings = [],  meeting = []
        
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
        

        // for matches
        let aU_seekings = userProfile.seekings
        let aU_offerings = userProfile.offerings
        let countS = 0
        let countO = 0
        if(aU_offerings.length > 0 && userS.length > 0){

            // userS.some(u=>{
                
            //     if(typeof aU_seekings.filter(aU => aU === u)[0] === 'string') ++countS 
            // })
            
            
            // In case if the above three lines does'nt perform
            userS.map(u=>{
                aU_offerings.map(aU=>{
                    
                    if(aU === u){
                        ++countS;
                    }
                })
            })
        }
        

        if(aU_seekings.length > 0 && userO.length > 0){

            // userO.some(u=>{
            //     if(typeof aU_offerings.filter(aU => aU === u)[0] === 'string') ++countO 
            // })
            
            // In case if the above three lines does'nt perform
            userO.map(u=>{
                aU_seekings.map(aU=>{
                    if(aU === u){
                        
                        ++countO;
                    }
                })
            })
        }

        userProfile.seekingCount = countS
        userProfile.offeringCount = countO
        userProfile.topMatch = countS + countO > 3 ? true : false
        let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
        userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();

        return userProfile

    })                                                             
    allProfiles.status = true
    allProfiles.profile = allProfiles.docs
    allProfiles.docs = undefined
    return res.json(allProfiles)        
                                        
    } catch(err) {res.json({status : false , message : err.message})}
    
}