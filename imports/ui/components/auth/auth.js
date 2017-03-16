import { Meteor } from 'meteor/meteor';
import './sign_in.html';
import './sign_up.html';

import { throwErrorr } from '../../../api/errors/error.js';

Template.sign_in.events({
	"click #sign_in_but": function(e, t){
		console.log("ssdsds");
		const email = $("input[name=email]").val();
		const pass  = $("input[name=pass]").val()
		Meteor.loginWithPassword(email,pass,function (err) {
			if (err) {
				throwErrorr(err.reason);
			}
		})
	},
	"click #sign_in_g_but": function(){

		Meteor.loginWithGoogle();
	}
});

Template.sign_up.events({
	"click #sign_up_but": function(e, t){
		console.log("ssdsds");
		var option = {};
		option.email = $("#sign_up_form input[name=email]").val();
		option.password  = $("#sign_up_form input[name=pass]").val();
		option.username = $("#sign_up_form input[name=user-name]").val();
		console.log(option);
		Meteor.call("signUp",option ,function (err) {
			if (err) {
				throwErrorr(err.reason);
			}
		})
	}
});
