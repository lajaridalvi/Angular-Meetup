const request = require('request')
var crypto = require('crypto');
import { linkedInCred } from './../../config'

var linkedInClientId = linkedInCred.clientID,
linkedInSecret = linkedInCred.clientSecret,
linkedInRedirectUri = linkedInCred.redirectUri

const scope = ['r_basicprofile','r_emailaddress'];

module.exports.oauthlinkedIn = (req, res) => {
    
    res.json({
        url: 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id='+linkedInClientId+'&redirect_uri='+ linkedInRedirectUri+'&state='+randomValueHex(10)+'&scope='+scope
    })
}

module.exports.oauthlinkedInRedirect = async (req, res) => {
    
    request.post({
        url: 'https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code='+req.query.code+'&redirect_uri='+ linkedInRedirectUri +'&client_id='+ linkedInClientId +'&client_secret='+ linkedInSecret,
        headers : {
        Host: 'www.linkedin.com',
        'Content-Type': 'application/x-www-form-urlencoded'
        }
    },(err, response, body) => {

        var access_token = JSON.parse(body).access_token
        request.get({
            url: 'https://api.linkedin.com/v1/people/~:(id,email-address,first-name,last-name,public-profile-url)?format=json',
            headers : {
                "Host": 'api.linkedin.com',
                "Connection": 'Keep-Alive',
                "Authorization": 'Bearer ' + access_token,
            },
        }, async (err, response, userDetails) => {
            console.log('userDetails :', userDetails);
            var email = JSON.parse(userDetails).emailAddress;
            var firstName = JSON.parse(userDetails).firstName;
            var lastName = JSON.parse(userDetails).lastName;
            var userSocialId = JSON.parse(userDetails).id;
            var userSocialType = 'LN'


            if (req.body.email) {
                req.body.email = req.body.email.toLowerCase();
            }
        
        
            const Fuser = await req.app.db.models.users.findOne({email}).exec()
            
            // if user found 
            // 1. Login Social user
            if(Fuser){
        
                // if(Fuser.userSocialId === userSocialId){
                    const token = await req.app.jwt.sign(Fuser, req.app.config.jwtSecret)
                    if(token) {
                    // return res.json({status : true, token : 'Bearer ' + token})
                    res.cookie('authorization', token);
                    res.redirect('/web/events/1');
                    }
                // }
                // else 
                //     return res.json({status : false,message : 'Wrong password, please try again'})
            }
            // if user not found 
            // 1. Register Social user
            // 2. Login Social user
            else {
                
                const user = req.app.db.models.users({
                    firstName,
                    lastName,
                    email,
                    userSocialId,
                    isSocialUser : true,
                    userSocialType
                })
        
                const savedUser = await user.save()
        
                if(savedUser) {
                    // the below condition is not required but still use it to make sure everything is checked properly
                    // if(savedUser.userSocialId === userSocialId){
                        const token = await req.app.jwt.sign(savedUser, req.app.config.jwtSecret)
                        if(token) {
                        // return res.json({status : true, token : 'Bearer ' + token})
                        res.cookie('authorization', token);
                        res.redirect('/web/events/1');
                        }
                    // }
                    // else 
                    //     return res.json({status : false,message : 'Wrong password, please try again'})
            
                }else 
                    return res.json({status : false,message : 'Error occured while registering user'})
            }

        })
        
    })
}

function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len).toUpperCase();   // return required number of characters
        return string = randomValueHex(4)+"-"+randomValueHex(4)+"-"+randomValueHex(4);
}

function fetchAccessToken(){
    request.post({
        url: '/oauth/v2/accessToken/grant_type=authorization_code&code='+req.query.code+'&redirect_uri='+ linkedInRedirectUri +'&client_id='+ linkedInClientId +'&client_secret='+ linkedInSecret,
        Host: 'www.linkedin.com',
        'Content-Type': 'application/x-www-form-urlencoded'
    },(err, response, body) => {
        console.log('body :', body);
    })
}