'use strict';
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

module.exports = function (app, mongoose) {
	var profileSchema = new mongoose.Schema({
		event: { type: mongoose.Schema.Types.ObjectId, ref: 'events' },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
		usersBookmarked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'profiles' }],
		pitch: { type: String },
		pitchUpdatedAt: { type: Date, default: Date.now },
		offerings: [String],
		seekings: [String],
		nav_schedule: [{ type: Number }],
		busy_schedule: [{
			code: { type: Number },
			// m -> meeting user
			m_user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
		}],
		user_meetings: [{
			            timeSlot: { type: Number },
			            meetingUser_P_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
			            message: String
		}],
		user_pending_meetings: [{
			            timeSlot: { type: Number },
			            meetingUser_P_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
			            message: String
		}],
		others_pending_meetings: [{
			            timeSlot: { type: Number },
			            meetingUser_P_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
			            message: String
		}],
		user_cancelled_meetings: [{
			            timeSlot: { type: Number },
			            meetingUser_P_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
			            message: String
		}]
	})

	profileSchema.plugin(require('./plugins/pagedFind'));
	profileSchema.plugin(mongooseAggregatePaginate);

	profileSchema.plugin(mongoosePaginate)
	profileSchema.index({
		username: 1
	});
	profileSchema.set('autoIndex', (app.get('env') === 'development'));
	app.db.model('profiles', profileSchema);
}




