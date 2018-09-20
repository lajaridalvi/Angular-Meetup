import { checkPermission } from '../middleware/permission'


module.exports = (app) => {
   
    // to make/add an event
    app.post('/api/sendMeetingRequest', require(__base + '/app/controllers/meeting.js').sendMeetingRequest);

    // accept meeting request
    app.post('/api/acceptOrRejectMeetingRequest', require(__base + '/app/controllers/meeting.js').acceptOrRejectMeetingRequest);

    //schedules for the user meeting with another user 
    app.post('/api/scheduleUserMeeting', require(__base + '/app/controllers/meeting.js').scheduleUserMeeting);

    // current meetings (O_pending_requests + user_meeting )
    app.post('/api/userMeetings', require(__base + '/app/controllers/meeting.js').userMeetings);

    // cancelled meetings (C_meeting of user)
    app.post('/api/userCancelledMeetings', require(__base + '/app/controllers/meeting.js').userCancelledMeetings);

    // cancelled meetings (U_pending_meeting of user (self pending requests))
    app.post('/api/userPendingMeetings', require(__base + '/app/controllers/meeting.js').userPendingMeetings);
};