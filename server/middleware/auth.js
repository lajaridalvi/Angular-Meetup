const uuidV4 = require('uuid/v4');
var unless = require('express-unless');

module.exports.userAuth = function(req, res, next){
    if(req.session && req.session.user){
        if(req.session.user.id == req.body.customerId) next();
        else res.status(200).jsonStatus(401).json({ message : 'authentication error'});

    }
};

module.exports.adminAuth = function(req, res, next){
    if(req.session.user && req.session.user){
        if(req.session.user.type == 'admin') next();
        else res.status(200).jsonStatus(401).json({ message : 'authentication error'});

    }
};

module.exports.moveToLoginPage = function (options) {

    // start all urls with /user, example accounts page
    var middleware = function(req, res, next){
        if(!req.JWTData){
            res.redirect('/login');
        }
        else if(req.JWTData && req.JWTData.user){
            if(req.JWTData.userType == 'guest'){
                res.redirect('/login');
            }
        }
        else{
            next();
        }
    };
    middleware.unless = unless;

    return middleware;

};

module.exports.makeAuthHappen = function(options){
    var middleware = function (req, res, next) {

        //check if cookie exists

        if(!req.cookies || !req.cookies.token){
            //if it does not exist create token

            var payload = {
                userType : 'guest',
                firstName : 'Guest',
                id : uuidV4()
            };
            var token = req.app.jwt.sign(payload, req.app.config.jwtSecret);

            // add token to cookie
            res.cookie('token', token);
            req.JWTData = payload;

            next();
            return;
        }

        // if cookie exists, decode and store
        var decoded = req.app.jwt.decode(req.cookies.token);
        req.JWTData = decoded;
        console.log('############ DECODED####');
        next();

    };

    middleware.unless = unless;

    return middleware;

};