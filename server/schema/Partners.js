'use strict';

module.exports = function (app, mongoose) {
    var partnerSchema = new mongoose.Schema({

        companyName: { type: String, require: true },
        companyImg: { type: String, require: true },
        companyUrl: { type: String, require: true },
        facebookUrl: { type: String, require: true },
        linkedinUrl: { type: String, require: true },
        companyCode: { type: String, require: true },
        Twitter: { type: String, require: true },

        // admin: [{
        //     pendingReq: { type: String, reqire: true },
        //     partners: { type: String, require: true }
        // }],
        admin:{ type :  mongoose.Schema.Types.ObjectId,ref : 'user' },
        event:{ type :  mongoose.Schema.Types.ObjectId,ref : 'events' },
        email:[]
    })
    partnerSchema.plugin(require('./plugins/pagedFind'));
    partnerSchema.index({
        companyName: 1
    });
    app.db.model('partners', partnerSchema);

}