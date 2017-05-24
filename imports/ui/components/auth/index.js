import { Meteor } from 'meteor/meteor';
import './sign-in.html';
import './sign-up.html';
import { errorHandler } from '../error-handler.js';

Template.sign_in.events({
	"click #sign_in_but": function(e, t){
		const email = $("input[name=email]").val();
		const pass  = $("input[name=pass]").val();
		if(!email){
			swal('', 'Email may not be empty', 'error');
			throw new Meteor.Error();	
		}
		Meteor.loginWithPassword(email, pass, errorHandler)
	},
	"click #sign_in_g_but": function(){
			Meteor.loginWithGoogle(errorHandler);
	}
});
Template.sign_up.events({
	"click #sign_up_but": function(e, t){
		const option = {};
		option.email = $("#sign_up_form input[name=email]").val();
		option.password  = $("#sign_up_form input[name=pass]").val();
		option.profile = {};
		const name = $("#sign_up_form input[name=user-name]").val();
		if(!name){
			swal('', 'Name may not be empty', 'error');	
		};
		option.profile.name = name;
		Accounts.createUser(option, errorHandler);		
	}
	
});
