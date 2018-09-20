"use strict";
var request = require('request');
const {
    method,
    url
} = request;
const {
    headers
} = request;

import {
    googleCred,
} from '../../config';

const {
    google
} = require('googleapis');

var googleClientId = googleCred.clientID,
    googleSecret = googleCred.clientSecret,
    googleRedirectUri = googleCred.redirectUri,
    hostAddress;

// module.exports = function (app) {
    // consent page route for google
    module.exports.googleauthpage =  (req, res, next) => {
        // generate a url that asks permissions for Google+ and Google Calendar scopes
        const scopes = [
            'https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/gmail.readonly'
        ];
        const oauth2Client = new google.auth.OAuth2(
            googleClientId,
            googleSecret,
            googleRedirectUri
        );


        const url1 = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            approval_prompt: 'force',

            // If you only need one scope you can pass it as a string
            scope: scopes
        });

        //    http.get('*',function(req,res){  
        //        res.redirect(url1)
        //    })
        res.json({
            url: url1
        })

    }

    
    module.exports.oauth2callback = (req, res, next) => {
        console.log("G1", req.body)
        "use strict";
        console.log('req.query.code :', req.body.code);
        (function (req, res) {
            // console.log("This is google cookie", req.cookies.googleGiftToken);
            hostAddress = req.headers.host;
            // console.log("G2", hostAddress)
            fetchGoogleAccessToken(req.body.code, (err, token) => {
                console.log("G3", token)
                if (err) {
                    res.json({
                        error: err
                    });
                    return;
                }
                
                fetchGooglePlusProfile(token.access_token, (err, user) => {
                    // console.log("G5")
                    if (err) {
                        res.send(err);
                        return;
                    }
                    req.app.db.models.users.findOne({
                        email: user.emails[0].value
                    }, function (err, userformDB) {
                        // console.log("G6")
                        if (err) {
                            winston.log(err);
                            return next(err);
                        }
                        if (userformDB == null) {
                            console.log("G7 create new")
                            addGoogleUserToDatabase(req.app, user, (err, newGoogleUser) => {
                                if (err) {
                                    console.log(err);
                                }

                                const token = req.app.jwt.sign(newGoogleUser, req.app.config.jwtSecret);
                                res.cookie('authorization', token);

                                res.redirect('/web/events/1');

                                // res.render('new/auth/googleRegister', {
                                //     user: req.JWTData,
                                //     name: user.name && user.name.givenName || "",
                                //     email: user.emails[0].value,
                                //     message: "",
                                //     lang: req.siteSettings.lang
                                // })
                            })
                        } else {
                            addGoogleUserToDatabase(req.app, user, (err, existingGoogleUser) => {
                                console.log('G8 update existing')
                                if (err) {
                                    console.log(err);
                                    return;
                                }

                                // if (existingGoogleUser.googleToken == user.id) {
                                    const token = req.app.jwt.sign(existingGoogleUser, req.app.config.jwtSecret);
                                    res.cookie('authorization', token);
                                    res.redirect('/web/events/1');
                                // }
                            })
                        }
                    })
                });

            });
        })(req, res);
    }

// };

// export {
// 	auth2Route
// }

function fetchGoogleAccessToken(authCode, callback) {
    // console.log('****', authCode)
    request.post({
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        url: 'https://www.googleapis.com/oauth2/v4/token?code=' + authCode + '&client_id=' + googleClientId + '&client_secret=' + googleSecret + '&redirect_uri=' + googleRedirectUri + '&scope=&grant_type=authorization_code',
    }, (err, res, body) => {
        // console.log('RESPONSE', res.statusCode)
        // console.log('BODY', body)
        if (!err && res.statusCode === 200) {
            callback(null, JSON.parse(body)); // passing access token to callback
            return;
        } else {
            console.log("Oops Error")
            winston.log(err);
            callback(err);
        }

    });
}

function fetchGooglePlusProfile(access_token, callback) {
    request.get({
            headers: {
                // 'content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Bearer ' + access_token,
                'Content-length': 0,
            },
            url: 'https://www.googleapis.com/plus/v1/people/me?access_token=' + access_token + ''
        },
        (err, res, body) => {
            if (!err && res.statusCode === 200) {
                var google_user = JSON.parse(body);
                google_user.access_token = access_token;
                callback(null, google_user);
                return;
            }
            winston.log(err);
            console.log('Error while fetching googleplus');
            // console.log(body);
            callback(err);
        });
}

function addGoogleUserToDatabase(app, google_user, callback) {

    // console.log('Adding google user to db');
    // console.log(google_user);
    //console.log(db.models);
    var user = parseGoogleUserToOurModel(google_user);
    app.db.models.users.findOneAndUpdate({
        email: user.email
    }, user, {
        upsert: true,
        new: true
    }, (err, result) => {
        if (err) {
            winston.log(err);
            callback(err);
            return;
        }
        // console.log('Google user created');
        // console.log("************result************ ", result);
        
        var payload = {
            id: result._id,
            userType: user.userType,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            // phoneNumber: user.phoneNumber,
            googleId: user.google.googleId,
            googleToken: user.google.googleToken
        };

        // console.log("##############payload############", payload);

        callback(null, payload);
    });
}

function parseGoogleUserToOurModel(google_user) {
    // Replace my User model
    // console.log("###########\n\n" + JSON.stringify(google_user) + "\n\n");
    var user = {};
    user.google = {};

    user.firstName = google_user.name.givenName || '';
    user.lastName = google_user.name.familyName || '';
    user.email = google_user.emails[0].value;
    user.google.googleId = google_user.id;
    user.google.googleToken = google_user.access_token;
    user.userType = 'user';
    user.photos = google_user.image.url;
    user.emailVerificationStatus = true;
    // user.phoneNumber = '';
    return user;
    // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    // console.log(user);
}