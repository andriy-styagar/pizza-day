import './add-participants.html';
import {errorHandler} from '../../../error-handler.js';
Template.addParticipants.onCreated(function () {
	this.groupId = FlowRouter.getParam('groupId');
	this.subscribe('users');    
});

Template.addParticipants.helpers({
	'addParticipants'(){
		const participants =  Meteor.users.find(
			{ groups: { $nin: [ Template.instance().groupId ]}},
			{ _id: 1, profile: 1 });
		return participants;
	}
});
Template.addParticipants.events({
	'click .add-participant-but': function(e, t){
		const userId = $(e.target).attr('id');
		const groupId = FlowRouter.getParam('groupId');
		Meteor.call('addParticapant', userId, groupId, errorHandler)
	}
})