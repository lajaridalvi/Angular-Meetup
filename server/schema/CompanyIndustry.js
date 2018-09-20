'use strict';

module.exports = function (app, mongoose) {
	var CompanyIndustrySchema = new mongoose.Schema({
        title : { type : String, required : true}
    })

    CompanyIndustrySchema.plugin(require('./plugins/pagedFind'));
	CompanyIndustrySchema.index({
		username: 1
	});
	CompanyIndustrySchema.set('autoIndex', (app.get('env') === 'development'));
	app.db.model('companyIndustries', CompanyIndustrySchema);
}



 
