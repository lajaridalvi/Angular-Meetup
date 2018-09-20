const validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateAddSeekingOrOffering(data){
    let err = {}

    data.code = !isEmpty(data.code) ? data.code : ''
    data.profileId = !isEmpty(data.profileId) ? data.profileId : ''
    


    if(validator.isEmpty(data.code)){
        err.code = 'code is required'
    }

    

    if(validator.isEmpty(data.profileId)){
        err.profileId = 'profileId is required'
    }



    return {
        errors : err,
        isValid : isEmpty(err)
    }
}