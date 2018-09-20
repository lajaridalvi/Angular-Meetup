import { checkPermission } from '../middleware/permission'

module.exports = (app) => {
   
    // to make/add an event
    app.post('/api/addEvent', require(__base + '/app/controllers/event.js').addEvents);
    
    // list of all events
    app.post('/api/getAllEvent', require(__base + '/app/controllers/event.js').getEvents);
    
    // join an event
    app.post('/api/joinEvent', require(__base + '/app/controllers/event.js').joinEvents);
    
    // for home page (for user list)
    app.post('/api/getAllEventsUsers', require(__base + '/app/controllers/event.js').getAllEventsUsers);
    
    // newest user 
    app.post('/api/getAllNewestUsers', require(__base + '/app/controllers/event.js').getAllNewestUsers);

    // newest user 
    app.post('/api/getAllMatchedUsers', require(__base + '/app/controllers/event.js').getAllMatchedUsers);

    //get event detail for one event (Home page)
    app.post('/getPublicEvent', require(__base + '/app/controllers/event.js').getPublicEvent);

    // add the EventKeys for matches
    app.post('/api/addEventKeys', require(__base + '/app/controllers/event.js').addEventKeys);

    // get / display all keys words of event (@require('event_id'))
    app.post('/api/getEventKeys', require(__base + '/app/controllers/event.js').getEventKeys);

    // get all partners
    app.post('/api/viewallPartners', require(__base + '/app/controllers/event.js').viewallPartners);

    // display event info 
    app.post('/api/getEventInfo', require(__base + '/app/controllers/event.js').getEventInfo);

    // event filter 
    app.post('/api/filterByEventKey', require(__base + '/app/controllers/event.js').filterByEventKey);
};