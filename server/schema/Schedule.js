'use strict';

module.exports = function (app, mongoose) {
	var scheduleSchema = new mongoose.Schema({
        day : {type : String , require : true},
        d_code : Number,
        timeData :
        [{
            time : {type : String , require : true},
            t_code : Number
        }],
    })

    scheduleSchema.plugin(require('./plugins/pagedFind'));
	scheduleSchema.index({
		username: 1
	});
	scheduleSchema.set('autoIndex', (app.get('env') === 'development'));
	app.db.model('schedules', scheduleSchema);
}




