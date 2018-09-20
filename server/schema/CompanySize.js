'use strict';

module.exports = function (app, mongoose) {
	var CompanySizeSchema = new mongoose.Schema({
    range : { type : String, required : true}
    })
    CompanySizeSchema.plugin(require('./plugins/pagedFind'));
	CompanySizeSchema.index({
	username: 1
	});
	CompanySizeSchema.set('autoIndex', (app.get('env') === 'development'));
	app.db.model('companySize', CompanySizeSchema);
}



 