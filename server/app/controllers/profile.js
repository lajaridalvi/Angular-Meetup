const moment = require('moment')
module.exports.addbookmarks = async (req,res)=>{
    const U_profileId = req.body.U_profileId
    const O_profileId = req.body.O_profileId
    try{
        const uBObj = await req.app.db.models.profiles.findOne({_id : U_profileId}).exec()

        if(uBObj){
            const isPresent = uBObj.usersBookmarked.indexOf(O_profileId)
            
            if(isPresent === -1){

                await req.app.db.models.profiles.update(
                    {_id : U_profileId},  
                    { $addToSet : {usersBookmarked : O_profileId }} )                        
    
                return res.json({status : true , message : 'user added to the bookmarked list' , isBookmarked : true })         
            }else {

                await req.app.db.models.profiles.update(
                    {_id : U_profileId},  
                    { $pull : {usersBookmarked : O_profileId }} )                        
    
                return res.json({status : true , message : 'user removed to the bookmarked list' , isBookmarked : false})         
            }
        
        }else {
            return res.json({status : false , message : 'user profile not found' })    
        }
    }catch(err){
        return res.json({status : false , message : err.message })
    }
    
                       
}


module.exports.addUserPitch = (req,res) => {
    const eventId = req.body.eventId
	const adminId = req.JWTData._doc._id
	const pitch = req.body.pitch
    
    req.app.db.models.profiles.findOne({event : eventId, user : adminId}).exec()
        .then(data=>{
            if(data){
                req.app.db.models.profiles.update({event : eventId, user : adminId}, { "$set" : {pitch}}).exec()
                                        .then(data=>{
                                            res.json({status : true , message : 'pitch updated' , data})    
                                        }).catch(err=>res.json({status : false , message : err.message}))
            }else {


                console.log('data :', data);

                const bookmarkData = {
                    event :  eventId,
                    user : adminId,
                    pitch 
                }

                console.log('bookmarkData :', bookmarkData);
                req.app.db.models.profiles.create(bookmarkData , (err, data)=>{

                    console.log('err :', err);
                    console.log('data :', data);
                    if (err) res.json({status :false , message : err.message})
                    res.json({status : true , message : 'pitch created', data})
                })           

                
            }
            
        })

}


debugger
module.exports.getAllBookmarkedUsers = async (req,res)=>{
    debugger
    const U_profileId = req.body.profileId
    
    try {
        let U_profile = await req.app.db.models.profiles.findOne({_id : U_profileId}).lean()
                                            .populate(
                                                {
                                                path: 'usersBookmarked',
                                                model : req.app.db.models.profiles,
                                                //select : ['_id', 'user', 'event', 'pitch','seekings','offerings','pitchUpdatedAt']
                                                }
                                            )
                                            .select('usersBookmarked user')
                                            .exec()
        const U_userId = U_profile.user                                                 
                                            // {
                                            //     path: 'usersBookmarked',
                                            //     model : req.app.db.models.users,
                                            //     select : ['firstName', 'profile', 'lastName', 'jobTitle', 'companyName']
                                            //     }
        U_profile.usersBookmarked = await req.app.db.models.users.populate(U_profile.usersBookmarked,{
            path: 'user',
            model : req.app.db.models.users,
            select : ['firstName', 'lastName', 'jobTitle', 'companyName', 'email']
            })                                        

        U_profile.usersBookmarked = await req.app.db.models.profiles.populate(U_profile.usersBookmarked,{
            path: 'user.profile',
            model : req.app.db.models.profiles,
            //select : ['_id', 'user', 'event', 'pitch','seekings','offerings','pitchUpdatedAt']
            })                                                    
        //return res.json(U_profile)
            U_profile.usersBookmarked.map(userProfile=>{
                
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
                        return JSON.stringify(a) === JSON.stringify(U_userId)
                    })
                }else{
                    userProfile.isAvailableForChat = false
                }

                let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
                userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow(); 
                userProfile.isBookmarked = true
                
                return userProfile
            })            
            
        return res.json(U_profile.usersBookmarked)                                            
        
    }catch(err){
        return res.json({status : false , message : err.message})
    }
}


