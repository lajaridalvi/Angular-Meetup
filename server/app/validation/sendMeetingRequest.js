const validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateSendingRequestForMeeting(data){
    let err = {}

    data.timeSlot = !isEmpty(data.timeSlot) ? data.timeSlot : ''
    data.O_profileId = !isEmpty(data.O_profileId) ? data.O_profileId : ''
    data.U_profileId = !isEmpty(data.U_profileId) ? data.U_profileId : ''
    data.message = !isEmpty(data.message) ? data.message : ''

    if(validator.isEmpty(data.timeSlot)){
        err.timeSlot = 'timeSlot is required'
    }

    if(validator.isEmpty(data.O_profileId)){
        err.O_profileId = 'O_profileId is required'
    }

    if(validator.isEmpty(data.U_profileId)){
        err.U_profileId = 'U_profileId is required'
    }

    if(validator.isEmpty(data.message)){
        err.message = 'message is required'
    }

    return {
        errors : err,
        isValid : isEmpty(err)
    }
}