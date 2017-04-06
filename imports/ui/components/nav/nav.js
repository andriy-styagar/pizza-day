import './nav.html';

Template.nav.events({
	"click #log_out_but": function (e, t) {
		Meteor.logout(function(err){
			if(err)
				swal('', err.reason, 'error');
		});
	}
});
Template.nav.helpers({
	'userName'(){
		if(Meteor.user()){
			return Meteor.user().profile.name;
		}
	},
	'isGroupParticipant'(){
		return Meteor.user().group;
	}

})