'use strict';

module.exports = function (app, mongoose) {

	// ekP -> Event key primary
	// ekS -> Event key secondary

	var eventKeySchema = new mongoose.Schema({
		eventId : { type :  mongoose.Schema.Types.ObjectId,ref : 'events' },
		eventData : [
			{
				primaryTitle : String,
				details : [String]
			}	
		]
	});

	eventKeySchema.plugin(require('./plugins/pagedFind'));
	eventKeySchema.index({
		username: 1
	});
	eventKeySchema.set('autoIndex', (app.get('env') === 'development'));
	app.db.model('eventKeys', eventKeySchema);

};