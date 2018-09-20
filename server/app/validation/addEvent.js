const validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateAddEvent(data){
    let err = {}

    data.eventTitle = !isEmpty(data.eventTitle) ? data.eventTitle : ''
    data.eventDesc = !isEmpty(data.eventDesc) ? data.eventDesc : ''
    data.eventCode = !isEmpty(data.eventCode) ? data.eventCode : ''
    data.userPitch = !isEmpty(data.userPitch) ? data.userPitch : 'Hey there, I m looking for new connections'
    data.startDate = !isEmpty(data.startDate) ? data.startDate : ''
    data.duration = !isEmpty(data.duration) ? data.duration : ''


    if(validator.isEmpty(data.eventTitle)){
        err.eventTitle = 'eventTitle is required'
    }

    if(validator.isEmpty(data.eventDesc)){
        err.eventDesc = 'eventDesc is required'
    }

    if(validator.isEmpty(data.eventCode)){
        err.eventCode = 'eventCode is required'
    }

    // if(validator.isEmpty(data.startDate)){
    //     err.startDate = 'startDate is required'
    // }

    if(validator.isEmpty(data.duration)){
        err.duration = 'duration is required'
    }

    if(!validator.isNumeric(data.duration)){
        err.duration = 'duration must be in Numeric'
    }

    if(!(parseInt(data.duration) >= 1 && parseInt(data.duration) <= 7)){
        err.duration = 'duration must be between 1 to 7 days'
    }


    return {
        errors : err,
        isValid : isEmpty(err)
    }
}