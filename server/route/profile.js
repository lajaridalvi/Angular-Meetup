import { checkPermission } from '../middleware/permission'

module.exports = (app) => {
    app.post('/api/addBookmarks', require(__base + '/app/controllers/profile.js').addbookmarks);

    // add/update pitch
    app.post('/api/addUserPitch' ,require(__base + '/app/controllers/profile.js').addUserPitch);

    // get all bookmark users
    app.post('/api/getAllBookmarkedUsers' ,require(__base + '/app/controllers/profile.js').getAllBookmarkedUsers);
    
    // add/update seekings
    // app.post('/api/addSeekings' ,require(__base + '/app/controllers/profile.js').addSeekings);
    // // add/update offerings
    // app.post('/api/addOfferings' ,require(__base + '/app/controllers/profile.js').addOfferings);
}