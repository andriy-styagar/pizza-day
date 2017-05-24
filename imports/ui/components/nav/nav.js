import './nav.html';
import { errorHandler } from '../error-handler.js';
Template.nav.events({
	"click #log_out_but": function (e, t) {
		Meteor.logout( errorHandler );
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