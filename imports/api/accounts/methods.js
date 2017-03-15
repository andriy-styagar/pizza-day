import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
//import { Accounts } from 'meteor/accounts-base';
Meteor.methods({
	"signUp": function(option){
		if(Match.test(option, {
			email: String,
			password: String,
			username: String 
		})){
			Accounts.createUser(option);
		}
		else
			throw new Meteor.Error("Bad email or password");
	}
})