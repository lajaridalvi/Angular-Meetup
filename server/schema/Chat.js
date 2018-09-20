'use strict';
const mongoosePaginate = require('mongoose-paginate')

module.exports = function (app, mongoose) {
	var chatSchema = new mongoose.Schema({
        sender : String,
        receiver : String,
        message : String,
        time : Number,
        key : String
    })

    chatSchema.plugin(require('./plugins/pagedFind'));
	chatSchema.index({
		key: 1
	});
    chatSchema.set('autoIndex', (app.get('env') === 'development'));
    chatSchema.plugin(mongoosePaginate)
	app.db.model('chat', chatSchema);
}




