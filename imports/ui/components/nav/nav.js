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
	'getUserName'(){
		if(Meteor.user()){
			return Meteor.user().profile.name;
		}
	},
	'isGroupParticipant'(){
		return Meteor.user() && Meteor.user().profile.group;
	}

})