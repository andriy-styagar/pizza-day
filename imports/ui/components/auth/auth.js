import { Meteor } from 'meteor/meteor';
import './sign_in.html';
import './sign_up.html';

Template.sign_in.events({
	"click #sign_in_but": function(e, t){
		console.log("ssdsds");
		const email = $("input[name=email]").val();
		const pass  = $("input[name=pass]").val()
		Meteor.loginWithPassword(email, pass, function (err) {
			if (err) {
				swal('', err.reason, 'error');
			}
		})
	},
	"click #sign_in_g_but": function(){
			Meteor.loginWithGoogle();
	}
});
Template.sign_up.events({
	"click #sign_up_but": function(e, t){
		const option = {};
		option.email = $("#sign_up_form input[name=email]").val();
		option.password  = $("#sign_up_form input[name=pass]").val();
		option.profile = {};
		const name = $("#sign_up_form input[name=user-name]").val();
			if(name){
				option.profile.name = name;
				Accounts.createUser(option,function(err){
				if (err){
					swal('', err.reason, 'error');
					}
				});
			}
			else
				swal('', 'Name may not be empty', 'error');			
	}
	
});
