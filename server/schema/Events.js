'use strict';


module.exports = function (app, mongoose) {
	var EventSchema = new mongoose.Schema({
		admin : { type :  mongoose.Schema.Types.ObjectId,ref : 'users' },
		eventTitle : { type : String, required : true} ,
		eventDesc : { type : String, required : true},
		eventCode : {type: String, required : true},
		eventBanner : {type : String, default : "http://wowslider.com/sliders/demo-10/data/images/dock.jpg"},
		usersProfiles : [{type : mongoose.Schema.Types.ObjectId,ref : 'profiles'}],
		startDate : {type : Date},
		duration : Number,
		eventKeys : { type :  mongoose.Schema.Types.ObjectId,ref : 'EventKeys' },
		partner:[ { type :  mongoose.Schema.Types.ObjectId,ref : 'partners' }],
	
    })

    EventSchema.plugin(require('./plugins/pagedFind'));
	EventSchema.index({
		username: 1
	});
	EventSchema.set('autoIndex', (app.get('env') === 'development'));
	app.db.model('events', EventSchema);
}




