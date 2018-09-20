import { read } from "fs";

module.exports = (app) => {
    app.get('/', require(__base + '/app/controllers/home').home);
    app.get('/signup', require(__base + '/app/controllers/home').signup)
    // app.get('/signinpage/:type', require(__base + '/app/controllers/home').signInPage)
    app.get('/web/signin', require(__base + '/app/controllers/home').signIn);
    app.post('/loginweb', require(__base + '/app/controllers/home').loginWeb);
    app.post('/registerweb', require(__base + '/app/controllers/home').registerUser);    
    // app.get('/web/events/:page', require(__base + '/app/controllers/home').showEvents);
    app.post('/web/events', require(__base + '/app/controllers/home').showEvents);
    app.post('/web/thisEvent', require(__base + '/app/controllers/home').getAllEventsUsers);
    app.post('/web/scheduleUser', require(__base +'/app/controllers/home').scheduleUser);
    app.post('/web/joinEvent', require(__base +'/app/controllers/home').joinEvents);
    app.get('/web/createEvent', require(__base+ '/app/controllers/home').createEventForm);
    app.post('/web/addEvent', require(__base + '/app/controllers/home').addEvents);
    app.post('/web/eventInfo', require(__base + '/app/controllers/home').eventInfo);
    app.get('/web/editProfile/:eventCode', require(__base + '/app/controllers/home').editProfile);
    app.get('/web/profileSettings', require(__base + '/app/controllers/home').profileSettings);
    app.post('/web/editProfileSettings', require(__base + '/app/controllers/home').editProfileSettings);
    app.post('/web/addBookmarks', require(__base + '/app/controllers/home').addbookmarks); 
    app.get('/web/addEventKeys/:eventCode', require(__base + '/app/controllers/home').addEventKeys);  
    app.post('/web/submitAddEventKeys/:eventCode/', require(__base + '/app/controllers/home').submitAddEventKeys);      
    app.get('/product', require(__base + '/app/controllers/home').allProduct);
    app.get('/pricing', require(__base + '/app/controllers/home').allPricing);
    app.get('/cases', require(__base + '/app/controllers/home').allCases);
    app.get('/blog' , require(__base + '/app/controllers/home').allBlogs);
    app.get('/careers', require(__base +'/app/controllers/home').allCareers);   
    app.get('/brellalite', require(__base +'/app/controllers/home').brellaLite);
    app.get('/brellaEnterprice', require(__base +'/app/controllers/home').brellaEnterprisePage);   
    app.get('/attendees', require(__base +'/app/controllers/home').allAttendees); 
    app.get('/feedback', require(__base +'/app/controllers/home').allfeedback);  
    app.get('/faq', require(__base +'/app/controllers/home').FAQ) ;
    app.get('/contact&sale', require(__base +'/app/controllers/home').contactforsale) ;
    app.post('/web/viewProfile/' ,require(__base +'/app/controllers/home').viewProfile);
    app.get('/web/logout', require(__base + '/app/controllers/home').logout);
    app.get('/web/seekoroffer/:SorO/:eventCode', require(__base + '/app/controllers/home').seekOrOffer);
    app.post('/web/addtoseekingoroffering/:eventCode', require(__base + '/app/controllers/home').addToSeekingOrOffering);
    app.post('/web/dashboard', require(__base + '/app/controllers/home').dashboardPage);
    app.post('/web/eventDetails', require(__base + '/app/controllers/home').eventDetails);
    app.post('/web/editEventDetails', require(__base + '/app/controllers/home').editEventDetails);
    app.post('/web/invite', require(__base + '/app/controllers/home').inviteCode);
    app.post('/googlelogin', require(__base+'/app/controllers/auth').googleauthpage);
    app.post('/oauth2callback', require(__base + '/app/controllers/auth').oauth2callback);
    app.get('/web/addPartnerForm/:eventCode', require(__base + '/app/controllers/home').addPartnerForm);
    app.post('/web/addPartner', require(__base + '/app/controllers/home').addPartners);
    app.post('/web/partners', require(__base + '/app/controllers/home').viewallPartners);
    app.post('/web/meetPartners', require(__base +'/app/controllers/home').meetPartners);
    app.get('/web/meetings', require(__base+ '/app/controllers/home').userMeetings);
    app.get('/web/suggestmeeting/:eventCode/:userId', require(__base + '/app/controllers/home').scheduleUserMeeting);
    app.post('/web/schedulemeeting/:userId/:eventCode', require(__base + '/app/controllers/home').sendMeetingRequest);
    app.post('/web/removeattendees', require(__base + '/app/controllers/home').removeattendees);
    app.post('/web/getallmatchedusers', require(__base + '/app/controllers/home').getAllMatchedUsers);
    app.get('/web/acceptorreject/:userId/:eventCode/:a_r_code', require(__base + '/app/controllers/home').acceptOrRejectMeetingRequest)
    app.post('/web/getAllBookmarkedUsers/', require(__base + '/app/controllers/home').getAllBookmarkedUsers)
    app.post('/web/getallnewestusers', require(__base + '/app/controllers/home').getAllNewestUsers);
    app.post('/web/scheduleuseravailability', require(__base + '/app/controllers/home').scheduleUserAvailability)
    app.post('/oauth/linkedin', require(__base + '/app/controllers/linkedInAuth').oauthlinkedIn)
    app.get('/linkedin/oauth2callback', require(__base + '/app/controllers/linkedInAuth').oauthlinkedInRedirect)
    app.post('/web/searchbyuser/:eventCode', require(__base + '/app/controllers/home').searchByUser)
    app.get('/web/filter/:eventCode', require(__base + '/app/controllers/home').filterPage)
    app.post('/web/filterbyeventkey/:eventCode', require(__base + '/app/controllers/home').filterByEventKey)
    app.post('/web/scheduleday/:eventCode', require(__base + '/app/controllers/home').schedulePage)
    app.post('/web/filterinterests/:SorO/:eventCode', require(__base + '/app/controllers/home').filterInterests)
    app.post('/web/searchbyusermatches/:eventCode', require(__base + '/app/controllers/home').searchByUserMatches)
    app.post('/web/cancelmeeting', require(__base + '/app/controllers/home').cancelMeetings)
}