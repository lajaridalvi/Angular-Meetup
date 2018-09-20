import {nodemailersend} from './../../util/sendmail'
import {validateEmail} from './collection'
import { status }from './../../config'
export const sendEmailtoDamac = (mailList ,message , subject) => {

		let errorMessage = message
		var mailOptions = {
			from: 'sejal@binarynumbers.io', // sender address
			to: mailList, // list of receivers   
			subject: subject ,//'Salesforce Lead Queue - Error Report ', // Subject line
			text: 'Test', // plain text 
			html: '<b>' + errorMessage + ' </b><br><br>' // html body
		};
		if(status != 'production'){
			mailOptions.subject = mailOptions.subject + ' - Test';
		}
    nodemailersend (mailOptions) ;
    
    console.log(mailOptions)
	
	} 

export const findAllAdmins = (db, errorMessage , subject)  => {
	var emailList = [];
	db.models.User.find({ permissions: { $in: ['admin'] } }, (error, adminData) => {
		if (error) {
			return;
		}
		adminData.forEach((item) => {
			if(validateEmail(item.email)){
				emailList.push(item.email)
			}
		});
	//	console.log(emailList.toString())
		sendEmailtoDamac(emailList.toString(), errorMessage, subject)
	})

};
