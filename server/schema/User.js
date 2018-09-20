'use strict';

module.exports = function (app, mongoose) {
	var UserSchema = new mongoose.Schema({
		email : { type : String , required : true },
		profileImage: { type : String },
		password : { type : String},
    	firstName: { type : String },
    	lastName: { type : String },
		companyName: { type : String },
    	jobTitle: { type : String },
    	companyIndustry: { type : String },
    	companySize: { type : String },
		companyRevenue: { type : String },
		accountType: { type : String },
		
		// for the social users (mobile)
		isSocialUser : { type : Boolean},
		userSocialId : {type : String},
		userSocialType : {type : String},
		
		linkedInUrl: {type : String},
		twitter: {type : String},
		skypeId: {type : String},
		profile : [{type : mongoose.Schema.Types.ObjectId,ref : 'profiles'}],
		
		google: {
            googleId:String,
            googleToken: String
        },	
		date: {
			type: Date,
			default: Date.now
		},
		

		
		//permissions: [{ type: String, enum: ['add', 'view', 'edit', 'edit_success', 'edit_failed', 'admin', 'upload', 'cron'] }]

	});

	UserSchema.plugin(require('./plugins/pagedFind'));
	UserSchema.index({
		username: 1
	});
	UserSchema.set('autoIndex', (app.get('env') === 'development'));

	// checking if password is valid
	UserSchema.methods.validPassword = function (password) {
		return app.bcrypt.compareSync(password, this.password);
	};

	//compare password
	UserSchema.pre('save', function (next) {
		console.log('presave');
		console.log(this);
		var user = this;
		var SALT_FACTOR = 5;

		if (!user.isModified('password')) return next();

		app.bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
			if (err) return next(err);
			

			app.bcrypt.hash(user.password, salt, function (err, hash) {
				

				if (err) return next(err);
				user.password = hash;
				next();
			});
		});
	});

	app.db.model('users', UserSchema);

};