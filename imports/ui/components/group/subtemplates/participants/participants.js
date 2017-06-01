import './participants.html';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { errorHandler } from '../../../error-handler.js';

Template.participants.onCreated(function () {
	this.groupId = FlowRouter.getParam('groupId');
	this.subscribe('groupParticipants', this.groupId);
});

Template.participants.helpers({
	'participants'(group){
		const participants =  Meteor.users.find(
			{ _id: { $in: group.participants } },
			{ _id: 1, profile: 1 });
		return participants;
	}
});
Template.participants.events({
	'click .remove-participant-but': function(e, t){
		const userId = $(e.target).attr('id');
		const groupId = FlowRouter.getParam('groupId');
		Meteor.call('removeParticipant', userId, groupId, errorHandler)
	}
});