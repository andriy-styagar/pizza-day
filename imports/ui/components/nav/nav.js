import './nav.html';

Template.nav.events({
	"click #log_out_but": function (e, t) {
		Meteor.logout(function(err){
			if(err)
				alert(err.reason);
		});
	}
});
Template.nav.helpers({
	"getUserName"(){
		var user = Meteor.user();
		if(user.username){
			return user.username;
		}
		else{
		//	alert(user.services[0].name);
			return user.profile.name;
		}
	}
})