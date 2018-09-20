const fs = require("fs");
const mongoose = require('mongoose')
const moment = require('moment')
const validateAddEvent = require('../validation/addEvent')
const isEmpty = require('../validation/is-empty')
const validateAddSeekingOrOffering = require('../validation/addToSeekingOrOffering')
const validateSendingRequestForMeeting = require('../validation/sendMeetingRequest')
const validator = require('validator');
const flash = require('flash')

module.exports.home = (req, res) => {
    res.render('home');
}

module.exports.signIn = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id

    if (userId) {
        res.redirect('/web/events/1')
    }
}

module.exports.loginWeb = (req, res) => {
    // debugger;
    // console.log('req.body :', req.body);
    if (req.body.email == undefined || req.body.password == undefined) {
        res.json({
            message: 'Your email and password are not correct'
        })
        // res.redirect('/web/signIn')
        return
    }
    const loginUser = {
        email: req.body.email,
        password: req.body.password
    }


    req.app.db.models.users.findOne({
        email: req.body.email
    }, (err, data) => {
        debugger;
        if (err) {
            res.json({
                message: "Database error"
            })
            // res.json({ status: false, message: "Database error" });
            return
        }
        if (!data) {
            res.json({
                message: "Email, you entered doesn't belong to meetup account"
            })
            // res.json({ status: false, message: "Email, you entered doesn't belong to meetup account" });
            return
        }

        req.app.bcrypt.compare(loginUser.password, data.password)
            .then(isMatched => {
                if (isMatched) {
                    req.app.jwt.sign(data, req.app.config.jwtSecret, (err, token) => {
                        debugger;
                        // res.json({
                        //     status: true,
                        //     token: 'Bearer ' + token
                        // })
                        // console.log('token :', token);
                        res.cookie('authorization', token)
                        res.json({
                            redirect: '/event',
                            token: token,
                            userId: data._id,
                            userFName: data.firstName,
                            userLName: data.lastName,
                            // userProfileColor: data.userProfileColor
                        });
                    })
                } else {
                    res.json({
                        message: 'Wrong password, please try again'
                    })
                    // res.json({
                    //     status: false,
                    //     message: 'Wrong password, please try again'
                    // })
                }

            }).catch(err => {
                res.json({
                    message: 'Login failed, please login again'
                })
                // res.json({
                //     status: false,
                //     message: 'login failed, please login again'
                // })

            })

    })
}

module.exports.showEvents = async (req, res) => {

    const userId = req.JWTData.id || req.JWTData._doc._id
    // const userId = "5b8003e6fdf0280ac4077c20";

    try {

        const data = await req.app.db.models.users.findOne({
                _id: userId
            })
            .select('profile')
            .populate('profile')
            .exec()

        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec()

        req.app.db.models.events.populate(data, {
            path: 'profile.event',
            select: ['eventTitle', 'eventDesc', 'eventCode', 'eventBanner', 'admin', 'startDate', 'duration'],
            model: req.app.db.models.events,

        }, (err, data1) => {

            if (err) return res.json({
                status: false,
                message: err.message
            })

            // return res.json(data1.profile)
            // console.log('data1.profile[0].event :', data1.profile[0].event);
            let upcomingevents = []
            let pastevents = []
            data1.profile.map(e => {
                console.log(e.event)
                let endDate = moment(e.event.startDate).add(3, 'days').format()
                let currentDate = moment(new Date).format()
                if (moment(currentDate).isBefore(endDate, 'day')) {
                    upcomingevents.push(e)
                } else {
                    pastevents.push(e)
                }
            })
            // res.render('events',
            //     {
            //         upcomingevents: upcomingevents,
            //         pastevents: pastevents,
            //         events: data1.profile,
            //         user: user
            //     })
            res.json({
                upcomingevents: upcomingevents,
                pastevents: pastevents,
                events: data1.profile,
                user: user
            })
        })

    } catch (err) {
        // return res.json({ status: false, message: err.message })
        res.redirect('/')
    }

};

module.exports.joinEvents = async (req, res) => {
    debugger
    console.log('req.body :', req.body);
    const userId = req.JWTData.id || req.JWTData._doc._id
    const eventCode = req.body.eventCode

    if (!eventCode || eventCode == undefined) return res.json({
        status: false,
        message: 'Provide eventCode'
    })

    const pitch = !req.body.pitch ? 'Hey there, I m looking for new connections' : req.body.pitch
    try {

        // Push Insert and Update of Profile Id  
        const Fevent = await req.app.db.models.events.findOne({
            eventCode
        }).exec()
        if (!Fevent) {
            return res.json({
                status: false,
                message: 'No event with this event code'
            })
        }
        const Fprofile = await req.app.db.models.profiles.findOne({
            $and: [{
                event: Fevent._id
            }, {
                user: userId
            }]
        }).exec()
        console.log('Fevent :', Fevent);
        if (Fprofile) {
            console.log('Fprofile :', Fprofile);

            // const updatedPro = await req.app.db.models.profiles.findOneAndUpdate({ event: Fevent._id, user: userId },
            //     { "pitch": pitch, "pitchUpdatedAt": new Date() }).exec()

            // const Fuser = await req.app.db.models.users.findOneAndUpdate({ _id: userId }, { "$addToSet": { profile: Fprofile._id } })
            //     .exec()

            // const Fevent = await req.app.db.models.events.findOneAndUpdate({ eventCode }, { "$addToSet": { usersProfiles: Fprofile._id } })
            //     .exec()
            // return res.json({status : true , eventId : Fevent._id, eventCode : Fevent.eventCode})
            // return res.send({redirect: '/web/thisEvent/' + Fevent._id + '/1'})
            res.json({
                status: false,
                message: 'You have already joined this event'
            })


        } else {


            const profile = new req.app.db.models.profiles({
                user: userId,
                event: Fevent._id,
                pitch
            })

            const savedProfile = await profile.save()

            if (savedProfile) {
                const Fevent = await req.app.db.models.events.findOneAndUpdate({
                        eventCode
                    }, {
                        "$addToSet": {
                            usersProfiles: savedProfile._id
                        }
                    })
                    .exec()
                const Fuser = await req.app.db.models.users.findOneAndUpdate({
                    _id: userId
                }, {
                    "$addToSet": {
                        profile: savedProfile._id
                    }
                }).exec()
                // return res.json({status : true , eventId : Fevent._id, eventCode : Fevent.eventCode})
                return res.json({
                    redirect: '/web/thisEvent/'+Fevent._id
                })

            }

        }
    } catch (err) {
        // return res.json({ status: false, message: err.message })
        res.redirect('/web/events/1')
    }


};

module.exports.getAllEventsUsers = async (req, res) => {
    const eventCode = req.body.eventCode
    const userId = req.JWTData.id || req.JWTData._doc._id
    // const userId =  "5b7ab74d6583390f04f2a70c"
    // const userId = "5b8003e6fdf0280ac4077c20";


    // const profileId = req.body.profileId

    if (!eventCode) return res.json({
        status: false,
        message: {
            eventCode: 'provide eventCode'
        }
    })
    // if(!profileId) return res.json({status : false , message : { profileId : 'provide profileId'}})

    try {

        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec();
        const event = await req.app.db.models.events.findOne({
            _id: eventCode
        }).exec();
        const eventKeys = await req.app.db.models.eventKeys.findOne({
            eventId: eventCode
        }).exec()
        let U_profile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: eventCode
            }]
        })
        let allProfiles = await req.app.db.models.profiles.paginate({
            $and: [{
                event: eventCode
            }, {
                _id: {
                    $ne: U_profile._id
                }
            }]
        }, {
            page: req.params.page,
            limit: 4,
            sort: {
                pitchUpdatedAt: 1
            },
            lean: true,
            populate: {
                path: 'user',
                select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle', 'profileImage'],
                model: req.app.db.models.users,
            }
        })

        allProfiles.docs = allProfiles.docs.map(userProfile => {
            let all_meetings = []
            let meeting = []



            if (userProfile.user_meetings.length > 0) {
                meeting = userProfile.user_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.user_pending_meetings.length > 0) {
                meeting = userProfile.user_pending_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.others_pending_meetings.length > 0) {
                meeting = userProfile.others_pending_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }

            if (all_meetings) {
                userProfile.isAvailableForChat = all_meetings.some(a => JSON.stringify(a) === JSON.stringify(U_profile.user))
            } else {
                userProfile.isAvailableForChat = false
            }
            userProfile.isBookmarked = U_profile.usersBookmarked.some(b => JSON.stringify(b) === JSON.stringify(userProfile._id))


            let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
            userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();
            return userProfile
        })
        allProfiles.status = true
        allProfiles.profile = allProfiles.docs
        allProfiles.docs = undefined
        // return res.json(allProfiles)
        res.json({
            events: event,
            users: allProfiles.profile,
            user: user,
            eventKeys: eventKeys,
            pages: allProfiles.pages,
            currentPage: allProfiles.page
        })

    } catch (err) {
        res.json({
            status: false,
            message: err.message
        })
        // res.redirect('/web/events/1')
    }
}

module.exports.scheduleUser = async (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id;
    // const userId =  "5b7ab74d6583390f04f2a70c";
    const eventId = req.body.eventId;


    try {
        const Fprofile = await req.app.db.models.profiles
            .findOne({
                $and: [{
                    user: userId
                }, {
                    event: eventId
                }]
            })
            .populate({
                path: 'user_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .populate({
                path: 'user_pending_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .populate({
                path: 'others_pending_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .exec()
        const event = await req.app.db.models.events.findOne({
            _id: eventId
        }).exec()
        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec()

        if (Fprofile) {

            const nav_schedule = Fprofile.nav_schedule

            let all_M_timeslots = []
            let P_O_timeslots = []
            Fprofile.user_meetings.map(u => {
                all_M_timeslots.push(u)
            })

            Fprofile.user_pending_meetings.map(u => {
                P_O_timeslots.push(u)
            })

            Fprofile.others_pending_meetings.map(u => {
                P_O_timeslots.push(u)
            })
            console.log('....>>>..>>>', Fprofile)
            let currentDate = new Date(event.startDate)
            // new Date(event.startDate)
            // console.log('currentDate :', currentDate.valueOf());
            // console.log('>>>>',Math.floor((new Date(currentDate.valueOf() + currentDate.getTimezoneOffset() * 60000) / 1000) - 3600));
            // console.log(event.startDate,new Date(event.startDate).toDateString() +" 13:40:08",'currentDate :', new Date(new Date(event.startDate).toDateString() +" 13:40:08"));
            // console.log('newDate : >>>>',moment(new Date(event.startDate).toDateString() +" 13:40:08").format('X'));
            let startDateAt9;
            // startDate.getHours()
            // startDate.getMinutes()
            // startDate.getSeconds()

            startDateAt9 = currentDate
            startDateAt9.setHours(9)
            startDateAt9.setMinutes(0)
            startDateAt9.setSeconds(0)
            startDateAt9.setMilliseconds(0)
            // let newDate = event.startDate.split('T')[0]
            let MstartDateAt9 = moment(startDateAt9).format('X')
            const dayArry = []
            // console.log('startDateAt9, MstartDateAt9 :', currentDate, MstartDateAt9);

            for (let i = 0; i < event.duration; i++) {

                let dayObj = {
                    day: '',
                    date: '',
                    times: []
                }

                dayObj.day = moment(MstartDateAt9, 'X').add(i, 'days').format('dddd')
                dayObj.date = moment(MstartDateAt9, 'X').add(i, 'days').format('MMMM Do YYYY')


                for (let j = 1; j <= 36; j++) {

                    let addedvalue = 15 * j + i * 24 * 60

                    let timeObj = {}

                    timeObj.data = moment(MstartDateAt9, 'X').add(addedvalue, 'minutes').format('X')
                    timeObj.status = 1
                    timeObj.user = {}
                    dayObj.times.push(timeObj);

                }
                dayArry.push(dayObj)
            }
            // console.log('nav_schedule :', nav_schedule);
            // if (nav_schedule.length > 0) {
            //     dayArry.map(day => {
            //         day.times.map(dayObj => {
            //             nav_schedule.map(sch => {
            //                 if (dayObj.status === 1 && dayObj.data == sch) {
            //                     dayObj.status = 2
            //                 }
            //             })

            //         })
            //     })

            //     // res.json({schedules: dayArry})
            //     res.render('schedules', { schedules: dayArry, user: user, events: event, moment: moment, i: 0 })
            // } else {
            // res.json({schedules: dayArry})                
            // res.render('schedules', { schedules: dayArry, user: user, events: event, moment: moment, i: 0 })
            // }
            // console.log('dayArry :', dayArry);
            if (nav_schedule.length > 0) {

                dayArry.map(day => {
                    day.times.map(dayObj => {
                        nav_schedule.map(sch => {

                            if (dayObj.status == 1 && dayObj.data == sch) {
                                dayObj.status = 2
                            }

                            if (dayObj.status == 1) {
                                all_M_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 3
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                            }

                            P_O_timeslots.map(all => {
                                if (all.timeSlot == dayObj.data) {
                                    dayObj.status = 4
                                    dayObj.user = all.meetingUser_P_Id
                                }
                            })

                        })

                    })
                })
            } else {
                dayArry.map(day => {
                    day.times.map(dayObj => {
                        // nav_schedule.map(sch => {

                        // if (dayObj.status == 1 && dayObj.data == sch) {
                        //     dayObj.status = 2
                        //     console.log('dayObj.status :', dayObj.status);
                        // }

                        if (dayObj.status == 1) {
                            if (all_M_timeslots.length > 0) {
                                all_M_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 3
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                                P_O_timeslots.map(all => {
                                    console.log('abc');

                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 4
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                            } else {
                                // all_M_timeslots.map(all => {
                                //     console.log('all == dayObj.data :', all == dayObj.data);
                                //     if (all == dayObj.data) 
                                //     dayObj.status = 3
                                //     console.log('dayObj.status1 :', dayObj.status);
                                // })
                                P_O_timeslots.map(all => {

                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 3
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                            }
                        }

                    })

                })
                // })

            }
            res.json({
                schedules: dayArry,
                user: user,
                events: event,
                moment: moment
            })

        } else {

        }

    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
        // res.send({redirect: '/web/events/1' })
    }
}

module.exports.schedulePage = async (req, res) => {

    console.log('req.body.page :', req.body.page);
    const userId = req.JWTData.id || req.JWTData._doc._id;
    const eventId = req.params.eventCode;


    try {
        const Fprofile = await req.app.db.models.profiles
            .findOne({
                $and: [{
                    user: userId
                }, {
                    event: eventId
                }]
            })
            .populate({
                path: 'user_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .populate({
                path: 'user_pending_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .populate({
                path: 'others_pending_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .exec()
        const event = await req.app.db.models.events.findOne({
            _id: eventId
        }).exec()
        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec()

        if (Fprofile) {

            const nav_schedule = Fprofile.nav_schedule

            let all_M_timeslots = []
            let P_O_timeslots = []
            Fprofile.user_meetings.map(u => {
                all_M_timeslots.push(u)
            })

            Fprofile.user_pending_meetings.map(u => {
                P_O_timeslots.push(u)
            })

            Fprofile.others_pending_meetings.map(u => {
                P_O_timeslots.push(u)
            })
            let currentDate = new Date(event.startDate)
            let startDateAt9 = event.startDate

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


            for (let i = 0; i < event.duration; i++) {

                let dayObj = {
                    day: '',
                    date: '',
                    times: []
                }

                dayObj.day = moment(MstartDateAt9, 'X').add(i, 'days').format('dddd')
                dayObj.date = moment(MstartDateAt9, 'X').add(i, 'days').format('MMMM Do YYYY')


                for (let j = 1; j <= 36; j++) {

                    let addedvalue = 15 * j + i * 24 * 60

                    let timeObj = {}

                    timeObj.data = moment(MstartDateAt9, 'X').add(addedvalue, 'minutes').format('X')
                    timeObj.status = 1
                    timeObj.user = {}
                    dayObj.times.push(timeObj);

                }
                dayArry.push(dayObj)
            }
            // console.log('nav_schedule :', nav_schedule);
            // if (nav_schedule.length > 0) {
            //     dayArry.map(day => {
            //         day.times.map(dayObj => {
            //             nav_schedule.map(sch => {
            //                 if (dayObj.status === 1 && dayObj.data == sch) {
            //                     dayObj.status = 2
            //                 }
            //             })

            //         })
            //     })

            //     // res.json({schedules: dayArry})
            //     res.render('schedules', { schedules: dayArry, user: user, events: event, moment: moment, i: 0 })
            // } else {
            // res.json({schedules: dayArry})                
            // res.render('schedules', { schedules: dayArry, user: user, events: event, moment: moment, i: 0 })
            // }
            console.log('dayArry :', dayArry);
            if (nav_schedule.length > 0) {

                dayArry.map(day => {
                    day.times.map(dayObj => {
                        nav_schedule.map(sch => {

                            if (dayObj.status == 1 && dayObj.data == sch) {
                                dayObj.status = 2
                            }

                            if (dayObj.status == 1) {
                                all_M_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 3
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                            }

                            P_O_timeslots.map(all => {
                                if (all.timeSlot == dayObj.data) {
                                    dayObj.status = 4
                                    dayObj.user = all.meetingUser_P_Id
                                }
                            })

                        })

                    })
                })
            } else {
                dayArry.map(day => {
                    day.times.map(dayObj => {
                        // nav_schedule.map(sch => {

                        // if (dayObj.status == 1 && dayObj.data == sch) {
                        //     dayObj.status = 2
                        //     console.log('dayObj.status :', dayObj.status);
                        // }

                        if (dayObj.status == 1) {
                            if (all_M_timeslots.length > 0) {
                                all_M_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 3
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                                P_O_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 4
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                            } else {
                                // all_M_timeslots.map(all => {
                                //     console.log('all == dayObj.data :', all == dayObj.data);
                                //     if (all == dayObj.data) 
                                //     dayObj.status = 3
                                //     console.log('dayObj.status1 :', dayObj.status);
                                // })
                                P_O_timeslots.map(all => {
                                    if (all == dayObj.data) {
                                        dayObj.status = 3
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                            }
                        }

                    })

                })
                // })

            }
            res.render('partials/scheduleDay', {
                schedules: dayArry,
                user: user,
                events: event,
                moment: moment,
                i: req.body.page
            })

        } else {

        }

    } catch (err) {
        console.log('err :', err);
        return res.json({
            status: false,
            message: err.message
        })
    }
}

module.exports.scheduleUserAvailability = async (req, res) => {
    // status => 
    // 0 => day
    // 1 => free for that time		
    // 2 => busy for that time		
    // 3 => busy with some other user
    const schedule_status = req.body.schedule_status
    const nav_schedule_time = req.body.nav_schedule_time
    // const profileId = req.body.profileId
    const userId = req.JWTData.id || req.JWTData._doc._id;
    // const userId =  "5b7ab74d6583390f04f2a70c";

    const eventId = req.body.eventId;

    try {

        if (schedule_status == 1) {
            const Fprofile = await req.app.db.models.profiles.findOneAndUpdate({
                $and: [{
                    user: userId
                }, {
                    event: eventId
                }]
            }, {
                $addToSet: {
                    "nav_schedule": nav_schedule_time
                }
            }).exec()

            if (!Fprofile) return res.json({
                status: false,
                message: 'profile did not get updated'
            })

            // else return res.json({ status: true, message: 'time added to the schedule' })
            else res.json({
                availability: 'unavailable'
            })
        } else if (schedule_status == 2) {

            const Fprofile = await req.app.db.models.profiles.findOneAndUpdate({
                $and: [{
                    user: userId
                }, {
                    event: eventId
                }]
            }, {
                $pull: {
                    "nav_schedule": nav_schedule_time
                }
            }).exec()

            if (!Fprofile) return res.json({
                status: false,
                message: 'profile did not get updated'
            })

            // else return res.json({ status: true, message: 'time removed from the schedule' })
            else res.json({
                availability: 'available'
            })
        } else {
            return res.json({
                status: false,
                message: 'invalid schedule_status'
            })
        }


    } catch (err) {
        res.json({
            status: false,
            message: err.message
        })
    }
}

module.exports.createEventForm = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id
    req.app.db.models.users.findOne({
        _id: userId
    }).exec().then(user => {
        res.render('createEvent', {
            user: user
        })
    })
}

module.exports.addEvents = async (req, res) => {
    console.log('DJWK');
    
    const admin = req.JWTData.id || req.JWTData._doc._id
    // const admin =  "5b7ab74d6583390f04f2a70c";
    // const admin = "5b8003e6fdf0280ac4077c20";

console.log(req.body.startDate)
    const eventTitle = req.body.eventTitle
    const eventDesc = req.body.eventDesc
    const eventCode = req.body.eventCode
    const userPitch = !req.body.pitch ? 'Hey there, I m looking for new connections' : req.body.pitch
    let startDate = moment(req.body.startDate).format();
    const duration = req.body.duration
    const usersProfiles = []
    console.log('req.body :', req.body);
    try {

        const Fevent = await req.app.db.models.events.findOne({
            eventCode
        }).exec()
        const dateEvent = await req.app.db.models.events.findOne({
            $and: [{
                startDate: startDate
            }, {
                admin: admin
            }]
        })
        // find for the event 
        if (Fevent) return res.json({
            status: false,
            message: 'Event already exists with same eventCode'
        })
        if (dateEvent) return res.json({
            status: false,
            message: 'You have an event on this day. Please choose another date.'
        })
        // else create a new event
        else {

            // create an event
            const event = new req.app.db.models.events({
                admin,
                eventTitle,
                eventDesc,
                eventCode,
                startDate,
                duration
            })
            // saving the newly created event object 
            const createdEvent = await event.save()

            // create a profile
            const profile = new req.app.db.models.profiles({
                user: admin,
                event: createdEvent._id,
                pitch: userPitch
            })
            const createdProfle = await profile.save()


            // pushing the newly create profile id to the event object 
            const updatedEvent = await req.app.db.models.events.update({
                _id: createdEvent._id
            }, {
                "$addToSet": {
                    usersProfiles: createdProfle._id
                }
            }).exec()

            const updatedUser = await req.app.db.models.users.findOneAndUpdate({
                _id: admin
            }, {
                "$addToSet": {
                    profile: createdProfle._id
                }
            }).exec()

            if (updatedEvent) {
                // console.log(createdEvent);
                
                // return res.json({status : true , message : 'Event created successfully'})
                // res.redirect('/web/thisEvent/1')
                res.json({
                    redirect: 'web/thisEvent/',
                    event: createdEvent
                })
            }
        }

    } catch (err) {
        return res.json({
            status: false,
            message: 'Please enter valid details.'
        })
    }

}

module.exports.eventInfo = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id
    // const userId =  "5b7ab74d6583390f04f2a70c";

    const eventCode = req.body.eventCode
    req.app.db.models.users.findOne({
        _id: userId
    }).exec().then(user => {
        req.app.db.models.events.findOne({
                _id: eventCode
            })
            .populate('users')
            .exec()
            .then(data => {
                let startDate = moment(data.startDate).format('DD.MM.YYYY')
                let todate = moment(data.startDate).add(data.duration - 1, 'days').format('DD.MM.YYYY');
                res.json({
                    user: user,
                    events: data,
                    startDate: startDate,
                    toDate: todate
                })
            })
            .catch(err =>
                // res.json({ status: false, message: err.message })
                res.json({
                    redirect: '/event'
                })
            )
    })

}

module.exports.editProfile = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id

    req.app.db.models.events.findOne({
        _id: req.params.eventCode
    }, (err, event) => {
        req.app.db.models.users.findOne({
            _id: userId
        }, (err, user) => {
            req.app.db.models.profiles.findOne({
                $and: [{
                    user: userId
                }, {
                    event: req.params.eventCode
                }]
            }, (err, profile) => {
                res.render('editProfile', {
                    user: user,
                    events: event,
                    profile: profile
                })
            })
        })
    })
}

module.exports.profileSettings = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id

    // req.app.db.models.events.findOne({ _id: req.params.eventCode }, (err, event) => {
    req.app.db.models.users.findOne({
        _id: userId
    }, (err, user) => {
        res.render('profileSettings', {
            user: user,
            // events: event
        })
    })
    // })
}

module.exports.editProfileSettings = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id
    console.log('req.body :', req.body);

    req.app.db.models.users.findOneAndUpdate({
        _id: userId
    }, {
        $set: req.body
    }, (err, user) => {
        if (err) {
            res.json({
                'status': false,
                'error': err
            })
        } else {
            res.redirect('/web/events/1');
        }
    })
    // console.log(req.body);
}

module.exports.addbookmarks = (req, res) => {
    const eventId = req.body.eventId
    const adminId = req.JWTData.id || req.JWTData._doc._id
    // const adminId =  "5b7ab74d6583390f04f2a70c";

    const userId = req.body.userId
    let bookmarkStatus = ''
    req.app.db.models.profiles.findOne({
            $and: [{
                event: eventId
            }, {
                user: adminId
            }]
        }).exec()
        .then(uBObj => {
            if (uBObj) {

                req.app.db.models.profiles.findOne({
                    $and: [{
                        event: eventId
                    }, {
                        user: userId
                    }]
                }, (err, userProfile) => {
                    const isPresent = uBObj.usersBookmarked.indexOf(userProfile._id)
                    if (isPresent === -1) {
                        req.app.db.models.profiles.findOneAndUpdate({
                            $and: [{
                                event: eventId
                            }, {
                                user: adminId
                            }]
                        }, {
                            $addToSet: {
                                usersBookmarked: userProfile._id
                            }
                        }, (err, data) => {
                            if (err) res.json({
                                status: false,
                                message: err.message
                            })
                            bookmarkStatus = 'ADDED'
                            return res.json(bookmarkStatus)
                        })
                    } else {
                        req.app.db.models.profiles.findOneAndUpdate({
                            $and: [{
                                event: eventId
                            }, {
                                user: adminId
                            }]
                        }, {
                            $pull: {
                                usersBookmarked: userProfile._id
                            }
                        }, (err, data) => {
                            if (err) res.json({
                                status: false,
                                message: err.message
                            })
                            bookmarkStatus = 'REMOVED'
                            res.json(bookmarkStatus)
                        })
                    }
                })

            } else {

                let usersBookmarked = []
                usersBookmarked.push(userId)
                const bookmarkData = {
                    event: eventId,
                    user: adminId,
                    usersBookmarked
                }

                req.app.db.models.profiles.create(bookmarkData, (err, data) => {
                    // return res.send(bookmarkStatus)
                    // res.json({ status: true, message: 'bookmark created', data })

                })

            }
        }).catch(err => {
            // res.json({ status: false, message: err.message })
            res.json({
                redirect: '/event'
            })

        })
}

module.exports.addEventKeys = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id
    req.app.db.models.users.findOne({
        _id: userId
    }, (err, user) => {
        req.app.db.models.events.findOne({
            _id: req.params.eventCode
        }, (err, event) => {
            req.app.db.models.eventKeys.findOne({
                eventId: req.params.eventCode
            }, (err, eventKey) => {
                if (eventKey) {
                    res.render('addEventKeys', {
                        events: event,
                        user: user,
                        eventKey: eventKey.eventData
                    })
                } else {
                    res.render('addEventKeys', {
                        events: event,
                        user: user,
                        eventKey: []
                    })
                }
            })
        })
    })
}

module.exports.submitAddEventKeys = (req, res) => {

    let eventKeyObj = {
        eventId: req.params.eventCode,
        eventData: JSON.parse(req.body.seekOrOffer)
    }

    req.app.db.models.eventKeys.findOne({
        eventId: eventKeyObj.eventId
    }, (err, eventkey) => {

        if (eventkey) {
            eventkey.eventData = eventKeyObj.eventData;
            eventkey.save()
            res.send({
                redirect: '/web/thisEvent/' + req.params.eventCode + '/1'
            })
        } else {
            req.app.db.models.eventKeys.create(eventKeyObj, (err, eventKey) => {
                if (err) {
                    console.log(err);
                } else {
                    req.app.db.models.events.update({
                        _id: req.params.eventCode
                    }, {
                        $set: {
                            eventKeys: eventKey._id
                        }
                    }, (err1, event) => {
                        if (err1) {
                            console.log(err1)
                        } else {
                            res.send({
                                redirect: '/web/thisEvent/' + req.params.eventCode + '/1'
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.allProduct = (req, res) => {
    res.render('product');
}

module.exports.allPricing = (req, res) => {
    res.render('pricing');
}

module.exports.allCases = (req, res) => {
    res.render('cases');
}

module.exports.allBlogs = (req, res) => {
    res.render('blog');
}

module.exports.allCareers = (req, res) => {
    res.render('careers');
}

module.exports.brellaLite = (req, res) => {
    res.render('brellalite');
}

module.exports.brellaEnterprisePage = (req, res) => {
    res.render('brellaEnterprice');
}

module.exports.allAttendees = (req, res) => {
    res.render('attendees');
}

module.exports.allfeedback = (req, res) => {
    res.render('feedback');
}

module.exports.FAQ = (req, res) => {
    res.render('faq');
}

module.exports.contactforsale = (req, res) => {
    res.render('contact&sale');
}

module.exports.viewProfile = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id
    // const userId =  "5b7ab74d6583390f04f2a70c";
    console.log('req.body', req.body);
    
    req.app.db.models.users.findOne({
        _id: userId
    }, (err, user) => {
        req.app.db.models.users.findOne({
            _id: req.body.userId
        }).lean().exec((err, profileUser) => {
            req.app.db.models.profiles.findOne({
                $and: [{
                    user: userId
                }, {
                    event: req.body.eventCode 
                }]
            }, (err, U_Profile) => {
                req.app.db.models.profiles.findOne({
                    $and: [{
                        user: req.body.userId
                    }, {
                        event: req.body.eventCode
                    }]
                }, (err, R_Profile) => {
                    
                    console.log('Rprofile', R_Profile);
                    
                    req.app.db.models.events.findOne({
                        _id: req.body.eventCode
                    }, (err, event) => {

                        profileUser.isAvailableForChat = false;
                        profileUser.isBookmarked = false;

                        U_Profile.user_meetings.map(um => {
                            if (JSON.stringify(um.meetingUser_P_Id) == JSON.stringify(R_Profile.user)) {
                                return profileUser.isAvailableForChat = true;
                            }
                        })
                        U_Profile.user_pending_meetings.map(upm => {
                            if (JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(R_Profile.user)) {
                                return profileUser.isAvailableForChat = true;
                            }
                        })
                        U_Profile.others_pending_meetings.map(opm => {
                            if (JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(R_Profile.user)) {
                                return profileUser.isAvailableForChat = true;
                            }
                        })
                        R_Profile.user_meetings.map(um => {
                            if (JSON.stringify(um.meetingUser_P_Id) == JSON.stringify(U_Profile.user)) {
                                return profileUser.isAvailableForChat = true;
                            }
                        })
                        R_Profile.user_pending_meetings.map(upm => {
                            if (JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(U_Profile.user)) {
                                return profileUser.isAvailableForChat = true;
                            }
                        })
                        R_Profile.others_pending_meetings.map(opm => {
                            if (JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(U_Profile.user)) {
                                return profileUser.isAvailableForChat = true;
                            }
                        })
                        U_Profile.usersBookmarked.map(uB => {
                            if (JSON.stringify(uB) == JSON.stringify(R_Profile._id)) {
                                return profileUser.isBookmarked = true;
                            }
                        })
                        let pitchUpdated = moment(R_Profile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
                        profileUser.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();
                        console.log('profileUser :', profileUser);

                        res.json({
                            events: event,
                            user: user,
                            profileUser: profileUser,
                            profile: U_Profile
                        })
                    })
                })
            })
        })
    })
}

module.exports.logout = (req, res) => {
    res.send({
        redirect: '/'
    })
}

module.exports.seekOrOffer = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id

    req.app.db.models.events.findOne({
        _id: req.params.eventCode
    }, (err, event) => {
        req.app.db.models.users.findOne({
            _id: userId
        }, (err, user) => {
            req.app.db.models.eventKeys.findOne({
                eventId: req.params.eventCode
            }).lean().exec((err, eventKey) => {
                req.app.db.models.profiles.findOne({
                    $and: [{
                        user: userId
                    }, {
                        event: event._id
                    }]
                }, (err, profile) => {

                    let eventKeys = []
                    if (eventKey) {
                        eventKey.eventData.map(e => {
                            let eventKeyArr = []
                            for (let k = 0; k < e.details.length; k++) {
                                let checked = ""
                                if (req.params.SorO === 'seeking') {
                                    if (profile.seekings.some(p => p === e.details[k])) {
                                        checked = "checked"
                                    } else {
                                        checked = ""
                                    }
                                } else {
                                    if (profile.offerings.some(p => p === e.details[k])) {
                                        checked = "checked"
                                    } else {
                                        checked = ""
                                    }
                                }
                                let eventKeyObj = {
                                    value: e.details[k],
                                    checked: checked
                                }
                                eventKeyArr.push(eventKeyObj)
                            }
                            return eventKeys.push({
                                primaryTitle: e.primaryTitle,
                                details: eventKeyArr
                            })
                        })
                        res.render('seekOrOffer', {
                            user: user,
                            events: event,
                            eventKeys: eventKeys,
                            seekOrOffer: req.params.SorO,
                            profileId: profile._id,
                            profile: profile
                        })
                    } else {
                        res.render('seekOrOffer', {
                            user: user,
                            events: event,
                            eventKeys: [],
                            seekOrOffer: req.params.SorO,
                            profileId: profile._id,
                            profile: profile
                        })
                    }
                })
            })
        })
    })
}

module.exports.addToSeekingOrOffering = async (req, res) => {

    // Seeking -> s
    // Offering -> o
    debugger;
    // const { isValid, errors } = validateAddSeekingOrOffering(req.body)
    // // console.log(isValid, 'error', errors)
    // console.log('isValid :', isValid);
    // // check validation
    // if (!isValid) {
    //     return res.status(400).json({ status: false, message: errors })
    // }

    try {
        // const userId = req.JWTData.id
        const code = req.body.code
        const profileId = req.body.profileId
        const eventKeys = req.body.eventKeys

        const Fprofile = await req.app.db.models.profiles.findOne({
            _id: profileId
        }).exec()

        if (code === 's') {
            Fprofile.seekings = eventKeys
        } else if (code === 'o') {
            Fprofile.offerings = eventKeys
        }
        const profile = await Fprofile.save()

        res.redirect('/web/editProfile/' + req.params.eventCode)
    } catch (err) {
        return res.json({
            status: true,
            message: err.message
        })
    }
}

module.exports.signup = (req, res) => {
    res.render('signup')
}
//to show partner form
module.exports.addPartnerForm = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id;
    const eventId = req.params.eventCode
    req.app.db.models.users.findOne({
        _id: userId
    }, (err, user) => {
        req.app.db.models.events.findOne({
            _id: eventId
        }, (err, event) => {
            res.render('addPartnerForm', {
                events: event,
                user: user,
                validator: validator
            });
        })
    })
}
//to add partners
module.exports.addPartners = async (req, res) => {
    console.log('bsfhdkj', req.body)
    debugger

    try {

        const eventId = req.body.eventCode
        let emails = []

        let data = await req.app.db.models.events.findOne({
                _id: eventId
            })
            .lean()
            .populate('usersProfiles')
            .exec()
        if (data) {
            console.log('data :', data);

            data = await req.app.db.models.users.populate(data, {
                path: 'usersProfiles.user',
                model: req.app.db.models.users,
            })

            // return res.json(data)

            data.usersProfiles.map(x => {
                // console.log('x :', x);
                if (x.user.companyName == req.body.companyName){
                    emails.push(x.user.email)
                }
            })
            let partnerObjects = {
                companyName: req.body.companyName,
                companyImg: req.body.companyImg,
                companyUrl: req.body.companyUrl,
                facebookUrl: req.body.facebookUrl,
                linkedinUrl: req.body.linkedinUrl,
                companyCode: req.body.companyCode,
                Twitter: req.body.twitterUrl,
                admin: data.admin,
                event: data._id,
                email: emails
            }

            req.app.db.models.partners.findOne({
                $and: [{
                    companyName: req.body.companyName
                }, {
                    companyCode: req.body.companyCode
                }]
            }, (err, partner) => {
                if (partner) {
                    res.json({
                        status: false,
                        message: 'Partner already exists'
                    })
                } else {
                    req.app.db.models.partners.create(partnerObjects, (err, success) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('success :', success);
                            data.partner.push(success._id);
                            // data.save();
                            console.log('data :', data);
                            // req.flash('partner Add Successfully')
                            res.json({
                                redirect: '/web/partners'
                            })
                        }
                    })
                }
            })
        }

    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }


}
//to showall partners
module.exports.viewallPartners = (req, res) => {

    const userId = req.JWTData.id || req.JWTData._doc._id
    // const userId =  "5b7ab74d6583390f04f2a70c";

    const eventId = req.body.eventCode
    req.app.db.models.events.findOne({
        _id: eventId
    }, (err, event) => {
        req.app.db.models.users.findOne({
            _id: userId
        }, (err, user) => {
            req.app.db.models.partners.find({
                event: eventId
            }, (err, partners) => {
                res.json({
                    user: user,
                    events: event,
                    partners: partners || []
                })

            });
        })
    })
}

module.exports.meetPartners = async (req, res) => {

    const userId = req.JWTData.id || req.JWTData._doc._id
    const eventCode = req.body.eventCode
    // console.log('req.params.companyName :', req.params.companyName);

    try {
        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec();
        const event = await req.app.db.models.events.findOne({
            _id: eventCode
        }).exec();
        const eventKeys = await req.app.db.models.eventKeys.findOne({
            eventId: eventCode
        }).exec()
        let U_profile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: eventCode
            }]
        })
        let allProfiles = await req.app.db.models.profiles.paginate({
            event: eventCode
        }, {
            page: req.params.page,
            limit: 4,
            sort: {
                pitchUpdatedAt: 1
            },
            lean: true,
            populate: {
                path: 'user',
                select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle'],
                match: {
                    companyName: req.body.companyName
                },
                model: req.app.db.models.users,
            }
        })
        allProfiles.docs = allProfiles.docs.filter(function (aP) {
            if (aP.user != null) {
                return aP
            };
        })

        allProfiles.docs = allProfiles.docs.map(userProfile => {
            let all_meetings = []
            let meeting = []



            if (userProfile.user_meetings.length > 0) {
                meeting = userProfile.user_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.user_pending_meetings.length > 0) {
                meeting = userProfile.user_pending_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.others_pending_meetings.length > 0) {
                meeting = userProfile.others_pending_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }

            if (all_meetings) {
                userProfile.isAvailableForChat = all_meetings.some(a => JSON.stringify(a) === JSON.stringify(U_profile.user))
            } else {
                userProfile.isAvailableForChat = false
            }
            userProfile.isBookmarked = U_profile.usersBookmarked.some(b => JSON.stringify(b) === JSON.stringify(userProfile._id))


            let aU_seekings = userProfile.seekings
            let aU_offerings = userProfile.offerings
            let countS = 0
            let countO = 0
            if (aU_offerings.length > 0 && userS.length > 0) {

                // userS.some(u=>{

                //     if(typeof aU_seekings.filter(aU => aU === u)[0] === 'string') ++countS 
                // })


                // In case if the above three lines does'nt perform
                userS.map(u => {
                    aU_offerings.map(aU => {
                        if (aU === u) {
                            console.log('aU, u :', aU, u);
                            ++countS;
                        }
                    })
                })
            }


            if (aU_seekings.length > 0 && userO.length > 0) {

                // userO.some(u=>{
                //     if(typeof aU_offerings.filter(aU => aU === u)[0] === 'string') ++countO 
                // })

                // In case if the above three lines does'nt perform
                userO.map(u => {
                    aU_seekings.map(aU => {
                        if (aU === u) {
                            console.log('aU, u -o:', aU, u);
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

            // let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
            // userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();
            // return userProfile
        })
        allProfiles.status = true
        allProfiles.profile = allProfiles.docs
        allProfiles.docs = undefined
        // return res.json(allProfiles) 
        res.json({
            events: event,
            users: allProfiles.profile,
            user: user,
            eventKeys: eventKeys,
            pages: allProfiles.pages,
            currentPage: allProfiles.page
        })

    } catch (err) {
        res.json({
            status: false,
            message: err.message
        })
    }
}

module.exports.registerUser = (req, res) => {
    if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
    }

    console.log(req.body);
    

    debugger;
    let user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        email: req.body.email,
        companyName: req.body.companyName,
        jobTitle: req.body.jobTitle,
    };

    debugger;
    if (!req.body.password || !req.body.email) {
        res.json({
            status: false,
            message: "Please fill in all details"
        });
        return
    }

    debugger;
    req.app.db.models.users.findOne({
        email: req.body.email
    }, function (err, data) {
        debugger;
        if (err) {
            res.json({
                status: false,
                message: "Database error"
            });
            return
        }
        if (data) {
            res.json({
                status: false,
                message: "Email Address Already Registered"
            });
            return
        }

        console.log(data);
        req.app.db.models.users.create(user, (err, data) => {
            debugger;
            console.log('data :', data);
            if (err) {
                res.json({
                    status: false,
                    message: "Database error",
                    error: err.message
                });
                return
            } else {
                console.log('data :', data);
                const loginUser = {
                    email: req.body.email,
                    password: req.body.password
                }
                req.app.db.models.users.findOne({
                    email: req.body.email
                }, (err, data) => {
                    debugger;
                    if (err) {
                        res.json({
                            status: false,
                            message: "Database error"
                        });
                        return
                    }
                    if (!data) {
                        res.json({
                            status: false,
                            message: "Email, you entered doesn't belong to meetup account"
                        });
                        return
                    }

                    req.app.bcrypt.compare(loginUser.password, data.password)
                        .then(isMatched => {
                            if (isMatched) {
                                req.app.jwt.sign(data, req.app.config.jwtSecret, (err, token) => {
                                    debugger;
                                    // res.json({
                                    //     status: true,
                                    //     token: 'Bearer ' + token
                                    // })
                                    // res.cookie('authorization', token)
                                    res.json({
                                        redirect: '/event',
                                        token:token,
                                        userId: data._id
                                    });
                                })
                            } else {
                                res.json({
                                    status: false,
                                    message: 'Wrong password, please try again'
                                })
                            }

                        }).catch(err => {
                            // res.json({
                            //     status: false,
                            //     message: 'Login failed, please login again'
                            // })
                            res.redirect('/')
                        })

                })

            }
            // res.json({ status: true, message: "User created successfully" });
        })
    });

}

module.exports.dashboardPage = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id
    // const userId =  "5b7ab74d6583390f04f2a70c";
    const eventId = req.body.eventCode
    req.app.db.models.users.findOne({
        _id: userId
    }).exec().then(user => {
        req.app.db.models.profiles.findOne({
            $and: [{
                event: eventId
            }, {
                user: userId
            }]
        }, (err, profile) => {
            console.log('profile', profile)
            req.app.db.models.events.findOne({
                    _id: eventId
                })
                .populate('users')
                .exec()
                .then(data => res.json({
                    events: data,
                    users: data.users,
                    user: user,
                    profile: profile
                }))
                .catch(err => res.json({
                    error: err,
                    redirect: '/web/events'
                }))
        })
    })

}

module.exports.eventDetails = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id
    // const userId =  "5b7ab74d6583390f04f2a70c";

    const eventCode = req.body.eventCode
    req.app.db.models.users.findOne({
        _id: userId
    }).exec().then(user => {
        req.app.db.models.events.findOne({
                _id: eventCode
            })
            .populate('users')
            .lean()
            .exec()
            .then(data => {
                data.startDate = moment(data.startDate).format('YYYY-MM-DD')
                res.json({
                    events: data,
                    users: data.users,
                    user: user,
                    startDate: moment(data.startDate).format('YYYY-MM-DD')
                })
            })
            .catch(err => res.json({
                redirect: '/web/events'
            }))
    })
}

module.exports.editEventDetails = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id
    // const userId =  "5b7ab74d6583390f04f2a70c";
    console.log('req.body :', req.body);
    const eventCode = req.body.eventCode
    let eventObj = {
        eventTitle: req.body.eventDetails.eventTitle,
        startDate: req.body.eventDetails.startDate,
        duration: parseInt(req.body.eventDetails.duration)
    }
    req.app.db.models.users.findOne({
        _id: userId
    }).exec().then(user => {
        req.app.db.models.events.findOne({
                $and: [{
                    startDate: eventObj.startDate
                }, {
                    admin: userId
                }, {
                    _id: {
                        $ne: eventCode
                    }
                }]
            }).then(eventExists => {
                req.app.db.models.events.findOne({
                        _id: eventCode
                    })
                    .populate('users')
                    .exec()
                    .then(data => {
                        if (data) {
                            if (eventExists) {
                                res.json({
                                    status: false,
                                    message: 'You already have an event starting on this date.'
                                })
                            } else {
                                data.eventTitle = eventObj.eventTitle;
                                data.startDate = eventObj.startDate;
                                data.duration = eventObj.duration;
                                data.save();
                                res.json({
                                    redirect: '/web/dashboard'
                                })
                            }
                        }
                    })
            })
            .catch(err => res.redirect('/web/events/1'))
    })
}

module.exports.inviteCode = (req, res) => {
    // const userId = req.JWTData.id || req.JWTData._doc._id
    const userId =  "5b7ab74d6583390f04f2a70c";
    const eventCode = req.body.eventCode

    req.app.db.models.users.findOne({
        _id: userId
    }).exec().then(user => {
        req.app.db.models.events.findOne({
                _id: eventCode
            })
            .populate('users')
            .exec()
            .then(data => res.json({
                events: data,
                users: data.users,
                user: user
            }))
            .catch(err => res.json({
                redirect: '/web/events'
            }))
    })
}

module.exports.uploadfile = (req, res) => {
    if (!req.file) {
        return res.status(400).json('Something went wrong.');
    }

    fs.rename(__base + '/public/uploads/' + req.file.filename, __base + '/public/uploads/' + req.file.filename + '.jpg', (err) => {
        if (err) {
            return res.status(400).json('Something went wrong.');
        }
        let image_data = {};
        image_data.url = "/uploads/" + req.file.filename + '.jpg';
        image_data.name = req.file.filename;
        res.json({
            image_data
        });
    })
}

module.exports.meetings = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id;
    // const userId =  "5b7ab74d6583390f04f2a70c";


    const eventId = req.params.eventCode;
    req.app.db.models.users.findOne({
        _id: userId
    }).exec().then(user => {
        req.app.db.models.events.findOne({
            _id: eventId
        }).exec().then(event => {
            req.app.db.models.profiles.findOne({
                    $and: [{
                        user: userId
                    }, {
                        event: eventId
                    }]
                })
                .populate({
                    path: 'others_pending_meetings.meetingUser_P_Id',
                    model: req.app.db.models.profiles
                })
                .exec()
                .then(profile => {


                    let pendingUserIds = profile.others_pending_meetings.map(opm => {
                        return opm.meetingUser_P_Id.user
                    })
                    req.app.db.models.profiles.findOne({
                            $and: [{
                                user: userId
                            }, {
                                event: eventId
                            }]
                        })
                        .populate({
                            path: 'user_meetings.meetingUser_P_Id',
                            model: req.app.db.models.profiles
                        })
                        .exec()
                        .then(meetProfile => {

                            let meetingUserIds = meetProfile.user_meetings.map(opm => {
                                return opm.meetingUser_P_Id.user
                            })

                            req.app.db.models.users.find({
                                    _id: {
                                        $in: meetingUserIds
                                    }
                                })
                                .exec()
                                .then(meetingUsers => {
                                    req.app.db.models.users.find({
                                            _id: {
                                                $in: pendingUserIds
                                            }
                                        })
                                        .exec()
                                        .then(pendingUsers => {
                                            res.render('meetings', {
                                                profile: profile,
                                                pendingUsers: pendingUsers,
                                                meetingUsers: meetingUsers,
                                                user: user,
                                                events: event
                                            })
                                        })
                                })
                        })
                })
        })
    })
}

module.exports.getAllMatchedUsers = async (req, res) => {

    const userId = req.JWTData.id || req.JWTData._doc._id
    const eventId = req.body.eventCode
    // const userId =  "5b7ab74d6583390f04f2a70c";


    if (!eventId) return res.json({
        status: false,
        message: {
            eventId: 'provide eventCode'
        }
    })
    // if(!profileId) return res.json({status : false , message : { profileId : 'provide profileId'}})

    try {
        let U_user = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: eventId
            }]
        }).exec()
        const userS = U_user.seekings
        const userO = U_user.offerings

        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec()
        const event = await req.app.db.models.events.findOne({
            _id: eventId
        }).exec()
        const eventKeys = await req.app.db.models.eventKeys.findOne({
            eventId: eventId
        }).exec()
        let U_profile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: eventId
            }]
        })
        let allProfiles = await req.app.db.models.profiles.paginate({
            $and: [{
                event: eventId
            }, {
                _id: {
                    $ne: U_profile._id
                }
            }]
        }, {
            page: req.params.page,
            limit: 4,
            lean: true,
            populate: {
                path: 'user',
                select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle', 'profileImage'],
                model: req.app.db.models.users,
            }
        })

        allProfiles.docs = allProfiles.docs.map(userProfile => {

            let all_meetings = [],
                meeting

            if (userProfile.user_meetings.length > 0) {
                meeting = userProfile.user_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.user_pending_meetings.length > 0) {
                meeting = userProfile.user_pending_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.others_pending_meetings.length > 0) {
                meeting = userProfile.others_pending_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }



            if (all_meetings) {
                userProfile.isAvailableForChat = all_meetings.some(a => JSON.stringify(a) === JSON.stringify(U_profile.user))
            } else {
                userProfile.isAvailableForChat = false
            }
            userProfile.isBookmarked = U_profile.usersBookmarked.some(b => JSON.stringify(b) === JSON.stringify(userProfile._id))


            // for matches
            let aU_seekings = userProfile.seekings
            let aU_offerings = userProfile.offerings
            let countS = 0
            let countO = 0
            if (aU_offerings.length > 0 && userS.length > 0) {

                // userS.some(u=>{

                //     if(typeof aU_seekings.filter(aU => aU === u)[0] === 'string') ++countS 
                // })


                // In case if the above three lines does'nt perform
                userS.map(u => {
                    aU_offerings.map(aU => {
                        if (aU === u) {
                            console.log('aU, u :', aU, u);
                            ++countS;
                        }
                    })
                })
            }


            if (aU_seekings.length > 0 && userO.length > 0) {

                // userO.some(u=>{
                //     if(typeof aU_offerings.filter(aU => aU === u)[0] === 'string') ++countO 
                // })

                // In case if the above three lines does'nt perform
                userO.map(u => {
                    aU_seekings.map(aU => {
                        if (aU === u) {
                            console.log('aU, u -o:', aU, u);
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
        // return res.json(allProfiles)  
        res.json({
            events: event,
            users: allProfiles.profile,
            user: user,
            eventKeys: eventKeys,
            pages: allProfiles.pages,
            currentPage: allProfiles.page
        })

    } catch (err) {
        res.json({
            status: false,
            message: err.message
        })
    }
}

module.exports.getEventInfo = async (req, res) => {
    const eventId = req.body.eventCode

    try {

        const event = await req.app.db.models.events.findOne({
            _id: eventId
        }).exec()

        if (event)
            return res.json({
                status: true,
                event
            })
        else
            return res.json({
                status: false,
                event
            })

    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }

}

module.exports.sendMeetingRequest = async (req, res) => {

    // const { isValid, errors } = validateSendingRequestForMeeting(req.body)
    // check validation
    // if (!isValid) {
    //     return res.status(400).json({ status: false, message: errors })
    // }

    const userId = req.JWTData.id || req.JWTData._doc._id;

    const timeSlot = req.body.timeSlot
    // const O_profileId = req.body.O_profileId
    // const U_profileId = req.body.U_profileId
    const message = req.body.message || `Hey I'd love to meet and have a quick conversation.`


    try {
        const Oprofile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: req.params.userId
            }, {
                event: req.params.eventCode
            }]
        }).lean().exec()
        const Uprofile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: req.params.eventCode
            }]
        }).lean().exec()

        if (Oprofile && Uprofile) {

            // insert send's userId inside others_pending_meetings of others / receviers profile object 
            if (Oprofile.others_pending_meetings !== undefined) {

                // add this to the receiver's profile
                const others_pending_meetings = {
                    timeSlot,
                    meetingUser_P_Id: Uprofile.user,
                    message
                }
                // add this to the sender's profile
                const user_pending_meetings = {
                    timeSlot,
                    meetingUser_P_Id: Oprofile.user,
                    message
                }
                // before adding check if its already present in the user_meetings array of both 
                if (Oprofile.user_meetings.length > 0 && Uprofile.user_meetings.length > 0) {
                    const O_isPresent = Oprofile.user_meetings.some(opm => JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(userId))
                    const U_isPresent = Uprofile.user_meetings.some(upm => JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(req.params.userId))
                    if (U_isPresent || O_isPresent) return res.json({
                        status: false,
                        message: 'both users are already set for a meeting'
                    })
                }

                if (Oprofile.others_pending_meetings.length > 0 && Uprofile.user_pending_meetings.length > 0) {
                    const O_isPresent = Oprofile.others_pending_meetings.some(opm => JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(userId))
                    const U_isPresent = Uprofile.user_pending_meetings.some(upm => JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(req.params.userId))


                    if (!O_isPresent && !U_isPresent) {
                        // perform insertion operation
                        await req.app.db.models.profiles.update({
                            _id: Oprofile._id
                        }, {
                            $addToSet: {
                                others_pending_meetings
                            }
                        })

                        await req.app.db.models.profiles.update({
                            _id: Uprofile._id
                        }, {
                            $addToSet: {
                                user_pending_meetings
                            }
                        })

                        // return res.json({ status: true, message: 'succesully sent the meeting request' })
                        res.redirect('/web/thisEvent/' + req.params.eventCode + '/1')


                    } else {
                        // do not perform updation, handle this on the user list page 
                        //(make sure to disable it for this route and redirect to the chat window )
                        return res.json({
                            status: false,
                            message: 'already sent the meeting request'
                        })
                    }


                } else {
                    // just insert it as the first item of an array
                    // perform insertion operation
                    await req.app.db.models.profiles.update({
                        _id: Oprofile._id
                    }, {
                        $addToSet: {
                            others_pending_meetings
                        }
                    })

                    await req.app.db.models.profiles.update({
                        _id: Uprofile._id
                    }, {
                        $addToSet: {
                            user_pending_meetings
                        }
                    })

                    // return res.json({ status: true, message: 'successfully sent the meeting request' })

                    res.redirect('/web/thisEvent/' + req.params.eventCode + '/1')
                }

            } else return res.json({
                status: false,
                message: 'receiver\'s profile does not contains meeting module'
            })
        } else {
            return res.json({
                status: false,
                message: 'receiver\'s / sender\'s profile not found'
            })
        }


    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }

}

module.exports.scheduleUserMeeting = async (req, res) => {
    // status => 
    // 0 => day
    // 1 => free for that time		
    // 2 => busy for that time		    // 3 => busy with some other user

    const userId = req.JWTData.id || req.JWTData._doc._id;
    const eventId = req.params.eventCode;
    const meetUserId = req.params.userId;

    try {
        const Uprofile = await req.app.db.models.profiles.findOne({
                user: userId,
                event: eventId
            })
            .populate({
                path: 'user_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .populate({
                path: 'others_pending_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .populate({
                path: 'user_pending_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .exec()
        const Rprofile = await req.app.db.models.profiles.findOne({
                user: meetUserId,
                event: eventId
            })
            .populate({
                path: 'user_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .populate({
                path: 'others_pending_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
            .populate({
                path: 'user_pending_meetings.meetingUser_P_Id',
                model: req.app.db.models.users
            })
        const event = await req.app.db.models.events.findOne({
            _id: eventId
        }).exec()
        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec()
        const meetUser = await req.app.db.models.users.findOne({
            _id: meetUserId
        }).exec()
        // let U_timeSlopt = Uprofile.user_meetings.filter(m=> {return m.timeSlot})
        // let R_timeSlopt = Rprofile.user_meetings.filter(m=> {return m.timeSlot})
        let U_M_timeslots = []
        let R_M_timeslots = []
        let U_P_O_timeslots = []
        let R_P_O_timeslots = []

        console.log('Rprofile :', Rprofile);
        Uprofile.user_meetings.map(u => {
            U_M_timeslots.push(u)
        })

        Rprofile.user_meetings.map(u => {
            R_M_timeslots.push(u)
        })

        Uprofile.user_pending_meetings.map(u => {
            U_P_O_timeslots.push(u)
        })

        Rprofile.user_pending_meetings.map(u => {
            R_P_O_timeslots.push(u)
        })

        Uprofile.others_pending_meetings.map(u => {
            U_P_O_timeslots.push(u)
        })

        Rprofile.others_pending_meetings.map(u => {
            R_P_O_timeslots.push(u)
        })

        if (Uprofile) {

            let nav_schedule = Uprofile.nav_schedule.concat(Rprofile.nav_schedule)

            let currentDate = new Date(event.startDate)
            let startDateAt9 = event.startDate

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


            for (let i = 0; i < event.duration; i++) {
                // let dayObj = {}

                //let updatedDate = moment(MstartDateAt9,'X').add(i, 'days')

                let dayObj = {
                    day: '',
                    date: '',
                    times: []
                }

                dayObj.day = moment(MstartDateAt9, 'X').add(i, 'days').format('dddd')
                dayObj.date = moment(MstartDateAt9, 'X').add(i, 'days').format('MMMM Do YYYY')

                // dayObj.times.push(moment(MstartDateAt9, 'X').add(15 * j, 'minutes').format('hh:mm a'))



                // dayObj.data = moment(MstartDateAt9, 'X').add(i, 'days').format('dddd')
                // dayObj.status = 0
                // push day
                // dayArry.push(dayObj)


                for (let j = 1; j <= 36; j++) {

                    let addedvalue = 15 * j + i * 24 * 60

                    // let dayObj = {}
                    let timeObj = {}

                    timeObj.data = moment(MstartDateAt9, 'X').add(addedvalue, 'minutes').format('X')
                    // timeObj.data = moment(MstartDateAt9, 'X').add(addedvalue, 'minutes').format('hh:mm a')

                    timeObj.status = 1
                    timeObj.user = {}
                    dayObj.times.push(timeObj);

                }
                dayArry.push(dayObj)
            }
            if (nav_schedule.length > 0) {

                dayArry.map(day => {
                    day.times.map(dayObj => {
                        nav_schedule.map(sch => {

                            if (dayObj.status == 1 && dayObj.data == sch) {
                                dayObj.status = 2
                            }

                            if (dayObj.status == 1) {
                                U_M_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 3
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                                R_M_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 4
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                            }

                            U_P_O_timeslots.map(all => {
                                if (all.timeSlot == dayObj.data) {
                                    dayObj.status = 5
                                    dayObj.user = all.meetingUser_P_Id
                                }
                            })
                            R_P_O_timeslots.map(all => {
                                if (all.timeSlot == dayObj.data) {
                                    dayObj.status = 5
                                    dayObj.user = all.meetingUser_P_Id
                                }
                            })

                        })

                    })
                })
            } else {
                dayArry.map(day => {
                    day.times.map(dayObj => {
                        if (dayObj.status == 1) {
                            if (U_M_timeslots.length > 0 || R_M_timeslots.length > 0) {
                                U_M_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 3
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                                R_M_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 4
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                                U_P_O_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 5
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                                R_P_O_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 6
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                            } else {
                                U_P_O_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 5
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                                R_P_O_timeslots.map(all => {
                                    if (all.timeSlot == dayObj.data) {
                                        dayObj.status = 6
                                        dayObj.user = all.meetingUser_P_Id
                                    }
                                })
                            }
                        }

                    })

                })
                // })

            }
            console.log('dayArry :', dayArry[0].times[4]);
            res.render('scheduleMeeting', {
                schedules: dayArry,
                user: user,
                events: event,
                moment: moment,
                meetUser: meetUser
            })
        } else {

        }

    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }
}

module.exports.removeattendees = (req, res) => {
    const U_Id = req.JWTData.id || req.JWTData._doc._id;
    // const U_Id =  "5b7ab74d6583390f04f2a70c";
    const eventId = req.body.eventId
    const userId = req.body.userId
    req.app.db.models.profiles.findOne({
        $and: [{
            event: eventId
        }, {
            user: userId
        }]
    }, (err, profile) => {
        let profileId = profile._id;
        let profileUser = profile.user;
        console.log('profileId :', profileId);


        req.app.db.models.profiles.find({
            event: eventId
        }, (err, U_Profiles) => {
            U_Profiles.map(U_Profile => {
                if (U_Profile.user_meetings.length > 0) {
                    U_Profile.user_meetings.map(um => {
                        if (JSON.stringify(um.meetingUser_P_Id) === JSON.stringify(profileUser)) {
                            U_Profile.user_meetings.pop(um)
                            return U_Profile
                        }
                    })
                }

                if (U_Profile.user_pending_meetings.length > 0) {
                    U_Profile.user_pending_meetings.map(upm => {
                        if (JSON.stringify(upm.meetingUser_P_Id) === JSON.stringify(profileUser)) {
                            U_Profile.user_pending_meetings.pop(upm)
                            return U_Profile
                        }
                    })
                }
                if (U_Profile.others_pending_meetings.length > 0) {
                    U_Profile.others_pending_meetings.map(opm => {
                        if (JSON.stringify(opm.meetingUser_P_Id) === JSON.stringify(profileUser)) {
                            U_Profile.others_pending_meetings.pop(opm)
                            return U_Profile
                        }
                    })
                }
                U_Profile.save();
            })

            req.app.db.models.profiles.findOneAndRemove({
                _id: profileId
            }, (err, deleted) => {

                req.app.db.models.users.findOne({
                    _id: userId
                }, (err, user) => {
                    user.profile.pop(profileId)
                    user.save();
                })

                req.app.db.models.events.findOne({
                    _id: eventId
                }, (err, event) => {
                    event.usersProfiles.pop(profileId)
                    event.save();
                    res.json({
                        redirect: '/web/thisEvent/'
                    })
                })
            })
        })
    })
}

module.exports.acceptOrRejectMeetingRequest = async (req, res) => {

    // const O_profileId = req.body.O_profileId
    // const U_profileId = req.body.U_profileId
    const userId = req.JWTData.id || req.JWTData._doc._id;
    const a_r_code = req.params.a_r_code

    try {
        const Oprofile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: req.params.userId
            }, {
                event: req.params.eventCode
            }]
        }).exec()
        const Uprofile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: req.params.eventCode
            }]
        }).exec()



        if (Oprofile && Uprofile) {
            // insert send's userId inside others_pending_meetings of others / receviers profile object 
            if (Oprofile.others_pending_meetings !== undefined) {

                // before adding check if its already present in the user_meetings array of both 
                if (Oprofile.user_meetings.length > 0 && Uprofile.user_meetings.length > 0) {
                    const O_isPresent = Oprofile.user_meetings.some(opm => JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(userId))
                    const U_isPresent = Uprofile.user_meetings.some(upm => JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(req.params.userId))
                    if (U_isPresent || O_isPresent) return res.json({
                        status: false,
                        message: 'both users are already set for a meeting'
                    })
                }
                // find the U-> o_pending_meeting array and O-> u_pending_meeting array
                if (Oprofile.user_pending_meetings.length > 0 && Uprofile.others_pending_meetings.length > 0) {
                    const O_isPresent = Oprofile.user_pending_meetings.filter(opm => JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(userId) ? opm : null)[0]
                    const U_isPresent = Uprofile.others_pending_meetings.filter(upm => JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(req.params.userId) ? upm : null)[0]

                    if (O_isPresent && U_isPresent) {

                        // removing the objects from the pending arrays 
                        Oprofile.user_pending_meetings.splice(
                            Oprofile.user_pending_meetings.findIndex(opm => JSON.stringify(opm.meetingUser_P_Id) == JSON.stringify(userId)), 1)
                        Uprofile.others_pending_meetings.splice(
                            Uprofile.others_pending_meetings.findIndex(upm => JSON.stringify(upm.meetingUser_P_Id) == JSON.stringify(req.params.userId)), 1)


                        //adding the arrays to the meeting arrays
                        if (a_r_code === 'a') {
                            Uprofile.user_meetings.push(U_isPresent)
                            Oprofile.user_meetings.push(O_isPresent)

                            await Uprofile.save()
                            await Oprofile.save()

                            // return res.json({status : true , message : 'successfully add to the meetings'})                
                            return res.redirect('/web/meetings/')
                        }
                        //not adding the arrays to the cancelled meeting arrays as, the user don'nt dont want to see declined request 
                        else if (a_r_code === 'r') {
                            // request declined hence, just cleaned up the pending arrays 
                            await Uprofile.save()
                            await Oprofile.save()
                            // return res.json({status : true , message : 'successfully declined for the meeting'})                
                            return res.redirect('/web/meetings/')
                        }
                    }

                } else return res.json({
                    status: false,
                    message: 'receiver\'s / sender\'s profile meeting array is empty'
                })

            } else return res.json({
                status: false,
                message: 'receiver\'s / sender\'s profile does not contains meeting module'
            })
        } else return res.json({
            status: false,
            message: 'receiver\'s / sender\'s profile not found'
        })


    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }

}

module.exports.getAllBookmarkedUsers = async (req, res) => {
    debugger
    const U_profileId = req.body.profileId
    const userId = req.JWTData.id || req.JWTData._doc._id;
    // const userId =  "5b7ab74d6583390f04f2a70c";

    const eventId = req.body.eventCode;


    try {
        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec()
        const event = await req.app.db.models.events.findOne({
            _id: eventId
        }).exec()
        let U_profile = await req.app.db.models.profiles.findOne({
                $and: [{
                    user: userId
                }, {
                    event: eventId
                }]
            }).lean()
            .populate({
                path: 'usersBookmarked',
                model: req.app.db.models.profiles,
                select: ['_id', 'user', 'event', 'pitch', 'seekings', 'offerings', 'pitchUpdatedAt']
            })
            .select('usersBookmarked')
            .exec()

        // {
        //     path: 'usersBookmarked',
        //     model : req.app.db.models.users,
        //     select : ['firstName', 'profile', 'lastName', 'jobTitle', 'companyName']
        //     }
        U_profile.usersBookmarked = await req.app.db.models.users.populate(U_profile.usersBookmarked, {
            path: 'user',
            model: req.app.db.models.users,
            select: ['firstName', 'lastName', 'jobTitle', 'companyName']
        })

        U_profile.usersBookmarked.map(userProfile => {
            let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
            userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();
            userProfile.isBookmarked = true
            debugger
            return userProfile
        })

        // return res.json(U_profile.usersBookmarked)   
        res.json({ events: event, users: U_profile.usersBookmarked, user: user })

    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }
}

module.exports.getAllNewestUsers = async (req, res) => {

    const eventCode = req.body.eventCode
    const userId = req.JWTData.id || req.JWTData._doc._id
    const profileId = req.body.profileId
    // const userId =  "5b7ab74d6583390f04f2a70c";


    if (!eventCode) return res.json({
        status: false,
        message: {
            eventCode: 'provide eventCode'
        }
    })
    // if(!profileId) return res.json({status : false , message : { profileId : 'provide profileId'}})


    try {

        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec();
        const event = await req.app.db.models.events.findOne({
            _id: eventCode
        }).exec();
        const eventKeys = await req.app.db.models.eventKeys.findOne({
            eventId: eventCode
        }).exec()
        let U_profile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: eventCode
            }]
        })
        let allProfiles = await req.app.db.models.profiles.paginate({
            $and: [{
                event: eventCode
            }, {
                _id: {
                    $ne: U_profile._id
                }
            }]
        }, {
            page: req.params.page,
            limit: 4,
            sort: {
                pitchUpdatedAt: -1
            },
            lean: true,
            populate: {
                path: 'user',
                select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle', 'profileImage'],
                model: req.app.db.models.users,
            }
        })

        allProfiles.docs = allProfiles.docs.map(userProfile => {
            let all_meetings = []
            let meeting = []



            if (userProfile.user_meetings.length > 0) {
                meeting = userProfile.user_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.user_pending_meetings.length > 0) {
                meeting = userProfile.user_pending_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.others_pending_meetings.length > 0) {
                meeting = userProfile.others_pending_meetings.map(u => u.meetingUser_P_Id)
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }

            if (all_meetings) {
                userProfile.isAvailableForChat = all_meetings.some(a => JSON.stringify(a) === JSON.stringify(U_profile.user))
            } else {
                userProfile.isAvailableForChat = false
            }
            userProfile.isBookmarked = U_profile.usersBookmarked.some(b => JSON.stringify(b) === JSON.stringify(userProfile._id))


            let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
            userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();
            return userProfile
        })
        allProfiles.status = true
        allProfiles.profile = allProfiles.docs
        allProfiles.docs = undefined
        // return res.json(allProfiles)  
        res.json({
            events: event,
            users: allProfiles.profile,
            user: user,
            pages: allProfiles.pages,
            currentPage: allProfiles.page,
            eventKeys: eventKeys
        })

    } catch (err) {
        res.json({
            status: false,
            message: err.message
        })
    }
}

module.exports.searchByUser = async (req, res) => {

    const userId = req.JWTData.id || req.JWTData._doc._id
    const eventId = req.params.eventCode
    const searchString = req.body.searchString
    // const profileId = req.body.profileId
    try {

        let user = await req.app.db.models.users.findOne({
            _id: userId
        })
        let event = await req.app.db.models.events.findOne({
            _id: eventId
        })
        let U_profile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: eventId
            }]
        })
        let All_profiles1 = req.app.db.models.profiles.aggregate({
                $unwind: '$user'
            }, {
                $match: {
                    $and: [{
                        'event': mongoose.Types.ObjectId(eventId)
                    }, {
                        '_id': {
                            $ne: mongoose.Types.ObjectId(userId)
                        }
                    }]
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                }
            },

            {
                $match: /*{$and : [ */
                //{'event' :  [mongoose.Types.ObjectId('5b41d3f21c79bf0408b1c816')]  },
                {
                    $or: [{
                            'user.firstName': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                        {
                            'user.lastName': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                        {
                            'user.companyName': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                        {
                            'user.jobTitle': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                        {
                            'user.email': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                    ]
                }
                //]}
            },
            //{$group: {_id: '$_id', firstName: {$first: '$user.firstName'}}},
            // { $limit: 20 },
            //{$skip : 1}
        )
        let All_profiles = await req.app.db.models.profiles.aggregatePaginate(All_profiles1, {
            page: 1,
            limit: 5
        })
        All_profiles = All_profiles.data.map(userProfile => {
            if (userProfile.user.length > 0) {
                userProfile.user = userProfile.user[0]

                let all_meetings = [],
                    meeting = []

                if (userProfile.user_meetings.length > 0) {
                    meeting = userProfile.user_meetings.map(u => {

                        return u.meetingUser_P_Id
                    })
                    all_meetings = all_meetings.concat(meeting)
                    meeting = []
                }
                if (userProfile.user_pending_meetings.length > 0) {
                    meeting = userProfile.user_pending_meetings.map(u => {
                        return u.meetingUser_P_Id
                    })
                    all_meetings = all_meetings.concat(meeting)
                    meeting = []
                }
                if (userProfile.others_pending_meetings.length > 0) {
                    meeting = userProfile.others_pending_meetings.map(u => {
                        return u.meetingUser_P_Id
                    })
                    all_meetings = all_meetings.concat(meeting)
                    meeting = []
                }



                if (all_meetings) {
                    userProfile.isAvailableForChat = all_meetings.some(a => JSON.stringify(a) === JSON.stringify(U_profile.user))
                } else {
                    userProfile.isAvailableForChat = false
                }

                userProfile.isBookmarked = U_profile.usersBookmarked.some(b => JSON.stringify(b) === JSON.stringify(userProfile._id))
                debugger

                let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
                userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();
                return userProfile


            }
        })
        // res.json(All_profiles)
        res.render('partials/search', {
            users: All_profiles,
            events: event,
            user: user

        })
    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }

}

module.exports.filterByEventKey = async (req, res) => {

    const userId = req.JWTData.id || req.JWTData._doc._id
    const code = req.body.code
    const eventId = req.params.eventCode
    const eventKey = req.body.eventKeys

    let q2 = {}
    const q1 = {
        event: eventId
    }

    if (code === 'o') q2 = {
        offerings: {
            $in: [eventKey]
        }
    }
    else if (code === 's') q2 = {
        seekings: {
            $in: [eventKey]
        }
    }

    const query = {
        $and: [q1, q2]
    }


    if (!eventId) return res.json({
        status: false,
        message: {
            eventId: 'provide eventCode'
        }
    })
    // if (!profileId) return res.json({ status: false, message: { profileId: 'provide profileId' } })

    try {
        // let U_user = await req.app.db.models.profiles.findOne({$and:[{user: userId}, {event:eventId}] }).exec()

        let U_profile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: eventId
            }]
        })
        const userS = U_profile.seekings
        const userO = U_profile.offerings
        const user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec();
        const event = await req.app.db.models.events.findOne({
            _id: eventId
        }).exec();
        let allProfiles = await req.app.db.models.profiles.paginate(query, {
            page: 1,
            limit: 10,
            lean: true,
            populate: {
                path: 'user',
                select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle'],
                model: req.app.db.models.users,
            }
        })

        allProfiles.docs = allProfiles.docs.map(userProfile => {

            let all_meetings = [],
                meeting = []

            if (userProfile.user_meetings.length > 0) {
                meeting = userProfile.user_meetings.map(u => {
                    return u.meetingUser_P_Id
                })
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.user_pending_meetings.length > 0) {
                meeting = userProfile.user_pending_meetings.map(u => {
                    return u.meetingUser_P_Id
                })
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }
            if (userProfile.others_pending_meetings.length > 0) {
                meeting = userProfile.others_pending_meetings.map(u => {
                    return u.meetingUser_P_Id
                })
                all_meetings = all_meetings.concat(meeting)
                meeting = []
            }



            if (all_meetings) {
                userProfile.isAvailableForChat = all_meetings.some(a => JSON.stringify(a) === JSON.stringify(U_profile._id))
            } else {
                userProfile.isAvailableForChat = false
            }
            userProfile.isBookmarked = U_profile.usersBookmarked.some(b => JSON.stringify(b) === JSON.stringify(userProfile._id))


            // for matches
            let aU_seekings = userProfile.seekings
            let aU_offerings = userProfile.offerings
            let countS = 0
            let countO = 0
            if (aU_offerings.length > 0 && userS.length > 0) {

                // userS.some(u=>{

                //     if(typeof aU_seekings.filter(aU => aU === u)[0] === 'string') ++countS 
                // })


                // In case if the above three lines does'nt perform
                userS.map(u => {
                    aU_offerings.map(aU => {

                        if (aU === u) {
                            ++countS;
                        }
                    })
                })
            }


            if (aU_seekings.length > 0 && userO.length > 0) {

                // userO.some(u=>{
                //     if(typeof aU_offerings.filter(aU => aU === u)[0] === 'string') ++countO 
                // })

                // In case if the above three lines does'nt perform
                userO.map(u => {
                    aU_seekings.map(aU => {
                        if (aU === u) {

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
        // return res.json(allProfiles) 
        let type = ''
        if (code === 'o') {
            type = 'Offering'
        } else {
            type = 'Seeking'
        }
        res.render('filterPage', {
            events: event,
            users: allProfiles.profile,
            user: user,
            eventKey: eventKey,
            type
        })

    } catch (err) {
        res.json({
            status: false,
            message: err.message
        })
    }

}

module.exports.filterPage = (req, res) => {
    // res.redirect('route')

}

module.exports.userMeetings = async (req, res) => {
    // const userId = req.JWTData.id || req.JWTData._doc._id
    // console.log('userId :', userId);
    const userId = "5b7ab74d6583390f04f2a70c";

    try {
        const pageUser = await req.app.db.models.users.findOne({
            _id: userId
        }).exec()
        let user = await req.app.db.models.users.findOne({
            _id: userId
        }).lean().select('profile').populate('profile', ['event', 'others_pending_meetings', 'user_meetings', 'user_pending_meetings', 'user_cancelled_meetings'])
        user = await req.app.db.models.events.populate(user, {
            path: 'profile.event',
            select: ['_id', 'eventTitle'],
            model: req.app.db.models.events,
        })
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.others_pending_meetings.meetingUser_P_Id',
            select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle', 'profileImage'],
            model: req.app.db.models.users
        })
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.user_meetings.meetingUser_P_Id',
            select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle', 'profileImage'],
            model: req.app.db.models.users
        })
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.user_pending_meetings.meetingUser_P_Id',
            select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle', 'profileImage'],
            model: req.app.db.models.users
        })
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.user_cancelled_meetings.meetingUser_P_Id',
            select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle', 'profileImage'],
            model: req.app.db.models.users
        })

        // return res.json(user)        

        let data = {}

        data.eventPendings = []
        data.eventMeeting = []
        data.eventUserPending = []
        data.eventCancelled = []

        user.profile.map(p => {
            debugger
            let eventP = {}
            let eventM = {}
            let eventUP = {}
            let eventC = {}

            eventP.eventName = p.event.eventTitle
            eventP.eventId = p.event._id
            // eventP.profileImage = p.event.profileImage

            eventP.P_meeting = []
            if (p.others_pending_meetings.length > 0) {
                p.others_pending_meetings.map(opm => {
                    opm.displayTimeSlot = moment(opm.timeSlot, 'X').format('dddd • h:mm a') + '-' + moment(opm.timeSlot, 'X').add(15, 'minutes').format('h:mm a')

                })
                eventP.P_meeting = eventP.P_meeting.concat(p.others_pending_meetings)
                data.eventPendings.push(eventP)
            }

            eventM.eventName = p.event.eventTitle
            eventM.eventId = p.event._id
            // eventM.profileImage = p.event.profileImage 

            eventM.U_meeting = []

            if (p.user_meetings.length > 0) {
                p.user_meetings.map(um => {
                    um.displayTimeSlot = moment(um.timeSlot, 'X').format('dddd • h:mm a') + '-' + moment(um.timeSlot, 'X').add(15, 'minutes').format('h:mm a')
                })
                eventM.U_meeting = eventM.U_meeting.concat(p.user_meetings)
                data.eventMeeting.push(eventM)
            }

            // console.log('p :', p);
            eventUP.eventName = p.event.eventTitle
            eventUP.eventId = p.event._id
            eventUP.UP_meeting = []

            if (p.user_pending_meetings.length > 0) {
                p.user_pending_meetings.map(um => {
                    um.displayTimeSlot = moment(um.timeSlot, 'X').format('dddd • h:mm a') + '-' + moment(um.timeSlot, 'X').add(15, 'minutes').format('h:mm a')
                })
                eventUP.UP_meeting = eventUP.UP_meeting.concat(p.user_pending_meetings)
                data.eventUserPending.push(eventUP)
            }
            eventC.eventName = p.event.eventTitle
            eventC.eventId = p.event._id

            eventC.C_meeting = []
            if (p.user_cancelled_meetings.length > 0) {
                p.user_cancelled_meetings.map(um => {
                    um.displayTimeSlot = moment(um.timeSlot, 'X').format('dddd • h:mm a') + '-' + moment(um.timeSlot, 'X').add(15, 'minutes').format('h:mm a')
                })
                eventC.C_meeting = eventC.C_meeting.concat(p.user_cancelled_meetings)
                data.eventCancelled.push(eventC)
            }
        })

        // return res.json(data)
        // res.render('meetings', {
        //     user: pageUser,
        //     eventPendings: data.eventPendings,
        //     eventMeeting: data.eventMeeting,
        //     eventUserPending: data.eventUserPending,
        //     eventCancelled: data.eventCancelled
        // })
        res.json({
            user: pageUser,
            eventPendings: data.eventPendings,
            eventMeeting: data.eventMeeting,
            eventUserPending: data.eventUserPending,
            eventCancelled: data.eventCancelled
        })
    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }

}

module.exports.userCancelledMeetings = async (req, res) => {

    const userId = req.JWTData._doc._id
    try {
        let user = await req.app.db.models.users.findOne({
            _id: userId
        }).lean().select('profile').populate('profile', ['event', 'user_cancelled_meetings'])
        user = await req.app.db.models.events.populate(user, {
            path: 'profile.event',
            select: ['eventTitle'],
            model: req.app.db.models.events,
        })
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.user_cancelled_meetings.meetingUser_P_Id',
            select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle'],
            model: req.app.db.models.users
        })


        let data = {}

        data.eventCancelled = []
        user.profile.map(p => {
            let eventC = {}

            eventC.eventName = p.event.eventTitle
            eventC.P_meeting = []
            eventC.P_meeting = eventC.P_meeting.concat(p.user_pending_meetings)
            data.eventCancelled.push(eventC)
        })

        return res.json(data)
    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }

}

module.exports.userPendingMeetings = async (req, res) => {
    const userId = req.JWTData._doc._id
    try {
        let user = await req.app.db.models.users.findOne({
            _id: userId
        }).lean().select('profile').populate('profile', ['event', 'user_pending_meetings'])
        user = await req.app.db.models.events.populate(user, {
            path: 'profile.event',
            select: ['eventTitle'],
            model: req.app.db.models.events,
        })
        user = await req.app.db.models.users.populate(user, {
            path: 'profile.user_pending_meetings.meetingUser_P_Id',
            select: ['firstName', 'lastName', 'email', 'companyName', 'jobTitle'],
            model: req.app.db.models.users
        })


        let data = {}

        data.eventPending = []
        user.profile.map(p => {
            let eventP = {}

            eventP.eventName = p.event.eventTitle
            eventP.P_meeting = []
            eventP.P_meeting = eventP.P_meeting.concat(p.user_pending_meetings)
            data.eventPending.push(eventP)
        })

        return res.json(data)
    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }

}

module.exports.filterInterests = (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id
    const search = req.body.searchString.toLowerCase()
    req.app.db.models.events.findOne({
        _id: req.params.eventCode
    }, (err, event) => {
        req.app.db.models.users.findOne({
            _id: userId
        }, (err, user) => {
            req.app.db.models.eventKeys.findOne({
                eventId: req.params.eventCode
            }, (err, eventKey) => {
                req.app.db.models.profiles.findOne({
                    $and: [{
                        user: userId
                    }, {
                        event: event._id
                    }]
                }, (err, profile) => {
                    let eventData = []
                    console.log('eventKey.eventData :', eventKey.eventData);
                    let eventKeys = []
                    if (eventKey) {
                        eventKey.eventData.map(ed => {
                            let eventKeyArr = []

                            ed.details.map(det => {

                                let checked = ""
                                if (req.params.SorO === 'seeking') {
                                    if (profile.seekings.some(p => p === det)) {
                                        checked = "checked"
                                    } else {
                                        checked = ""
                                    }
                                } else {
                                    if (profile.offerings.some(p => p === det)) {
                                        checked = "checked"
                                    } else {
                                        checked = ""
                                    }
                                }
                                if (det.toLowerCase().indexOf(search) != -1) {
                                    // if(eventData.indexOf)
                                    let eventKeyObj = {
                                        value: det,
                                        checked: checked
                                    }
                                    eventKeyArr.push(eventKeyObj)
                                }
                            })
                            if (eventKeyArr.length > 0) {
                                // eventData.push({ primaryTitle: ed.primaryTitle, details })
                                return eventKeys.push({
                                    primaryTitle: ed.primaryTitle,
                                    details: eventKeyArr
                                })
                            }

                        })
                        // let eventKeys = {
                        //     _id: eventKey._id,
                        //     eventId: eventKey.eventId,
                        //     eventData: eventData
                        // }
                        console.log('eventKeyspartial :', eventKeys);
                        res.render('partials/filterInterests1', {
                            user: user,
                            events: event,
                            eventKeys: eventKeys,
                            seekOrOffer: req.params.SorO,
                            profileId: profile._id
                        })
                    } else {
                        res.render('partials/filterInterests1', {
                            user: user,
                            events: event,
                            eventKeys: [],
                            seekOrOffer: req.params.SorO,
                            profileId: profile._id
                        })
                    }
                })
            })
        })
    })
}

module.exports.searchByUserMatches = async (req, res) => {

    const userId = req.JWTData.id || req.JWTData._doc._id
    const eventId = req.params.eventCode
    const searchString = req.body.searchString
    // const profileId = req.body.profileId
    console.log('req.body :', req.body);
    try {

        let user = await req.app.db.models.users.findOne({
            _id: userId
        })
        let event = await req.app.db.models.events.findOne({
            _id: eventId
        })
        let U_profile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: eventId
            }]
        })
        const userS = U_profile.seekings
        const userO = U_profile.offerings
        let All_profiles1 = req.app.db.models.profiles.aggregate({
                $unwind: '$user'
            }, {
                $match: {
                    'event': mongoose.Types.ObjectId(eventId)
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                }
            },

            {
                $match: /*{$and : [ */
                //{'event' :  [mongoose.Types.ObjectId('5b41d3f21c79bf0408b1c816')]  },
                {
                    $or: [{
                            'user.firstName': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                        {
                            'user.lastName': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                        {
                            'user.companyName': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                        {
                            'user.jobTitle': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                        {
                            'user.email': {
                                '$regex': searchString,
                                '$options': 'i'
                            }
                        },
                    ]
                }
                //]}
            },
            //{$group: {_id: '$_id', firstName: {$first: '$user.firstName'}}},
            // { $limit: 20 },
            //{$skip : 1}
        )
        let All_profiles = await req.app.db.models.profiles.aggregatePaginate(All_profiles1, {
            page: 1,
            limit: 5
        })
        All_profiles = All_profiles.data.map(userProfile => {
            if (userProfile.user.length > 0) {
                userProfile.user = userProfile.user[0]

                let all_meetings = [],
                    meeting = []

                if (userProfile.user_meetings.length > 0) {
                    meeting = userProfile.user_meetings.map(u => {

                        return u.meetingUser_P_Id
                    })
                    all_meetings = all_meetings.concat(meeting)
                    meeting = []
                }
                if (userProfile.user_pending_meetings.length > 0) {
                    meeting = userProfile.user_pending_meetings.map(u => {
                        return u.meetingUser_P_Id
                    })
                    all_meetings = all_meetings.concat(meeting)
                    meeting = []
                }
                if (userProfile.others_pending_meetings.length > 0) {
                    meeting = userProfile.others_pending_meetings.map(u => {
                        return u.meetingUser_P_Id
                    })
                    all_meetings = all_meetings.concat(meeting)
                    meeting = []
                }

                if (all_meetings) {
                    userProfile.isAvailableForChat = all_meetings.some(a => JSON.stringify(a) === JSON.stringify(U_profile.user))
                } else {
                    userProfile.isAvailableForChat = false
                }

                userProfile.isBookmarked = U_profile.usersBookmarked.some(b => JSON.stringify(b) === JSON.stringify(userProfile._id))
                debugger


                let aU_seekings = userProfile.seekings
                let aU_offerings = userProfile.offerings
                let countS = 0
                let countO = 0
                if (aU_offerings.length > 0 && userS.length > 0) {

                    // userS.some(u=>{

                    //     if(typeof aU_seekings.filter(aU => aU === u)[0] === 'string') ++countS 
                    // })


                    // In case if the above three lines does'nt perform
                    userS.map(u => {
                        aU_offerings.map(aU => {

                            if (aU === u) {
                                ++countS;
                            }
                        })
                    })
                }


                if (aU_seekings.length > 0 && userO.length > 0) {

                    // userO.some(u=>{
                    //     if(typeof aU_offerings.filter(aU => aU === u)[0] === 'string') ++countO 
                    // })

                    // In case if the above three lines does'nt perform
                    userO.map(u => {
                        aU_seekings.map(aU => {
                            if (aU === u) {

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


                // let pitchUpdated = moment(userProfile.pitchUpdatedAt).format('MMMM Do YYYY, h:mm:ss a')
                // userProfile.displayTimeFrom = moment(pitchUpdated, "MMMM Do YYYY, h:mm:ss a").fromNow();
                // return userProfile


            }
        })
        // res.json(All_profiles)
        console.log('All_profiles.data :', All_profiles);
        res.render('partials/searchMatches', {
            users: All_profiles,
            events: event,
            user: user

        })
    } catch (err) {
        return res.json({
            status: false,
            message: err.message
        })
    }

}

module.exports.cancelMeetings = async (req, res) => {
    const userId = req.JWTData.id || req.JWTData._doc._id;
    // const userId = req.body.userId;
    const meetUserId = req.body.MU_Id;
    const eventId = req.body.eventId;
    console.log('req.body :', req.body);
    try {
        let user = await req.app.db.models.users.findOne({
            _id: userId
        }).exec();
        let Uprofile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: userId
            }, {
                event: eventId
            }, {
                user_meetings: {
                    $elemMatch: {
                        meetingUser_P_Id: meetUserId
                    }
                }
            }]
        }).exec();
        let Rprofile = await req.app.db.models.profiles.findOne({
            $and: [{
                user: meetUserId
            }, {
                event: eventId
            }, {
                user_meetings: {
                    $elemMatch: {
                        meetingUser_P_Id: userId
                    }
                }
            }]
        }).exec();
        let UmeetingId = Uprofile.user_meetings._id;
        let RmeetingId = Rprofile.user_meetings._id;
        let Rindex, Uindex;
        let UcancelledMeeting = Uprofile.user_meetings.map(U_um => {
            if (U_um.meetingUser_P_Id == meetUserId) {
                return U_um
            }
        })
        Uindex = Rprofile.user_meetings.indexOf(UcancelledMeeting[0])
        Uprofile.user_cancelled_meetings.push(UcancelledMeeting[0]);
        Uprofile.user_meetings.splice(Uindex, 1);
        Uprofile.save();
        console.log('UcancelledMeeting :', UcancelledMeeting);
        let RcancelledMeeting = Rprofile.user_meetings.map(R_um => {
            if (R_um.meetingUser_P_Id == userId) {
                return R_um
            }
        })
        Rindex = Rprofile.user_meetings.indexOf(RcancelledMeeting[0])
        Rprofile.user_cancelled_meetings.push(RcancelledMeeting[0]);
        Rprofile.user_meetings.splice(Rindex, 1);
        Rprofile.save();
        console.log('RcancelledMeeting :', RcancelledMeeting);
        // res.json({ Uprofile: Uprofile, Rprofile: Rprofile })
        res.redirect('/web/meetings')

    } catch (err) {
        // return res.json({ status: false, message: err.message })
        res.redirect('/web/events/1')
    }
}