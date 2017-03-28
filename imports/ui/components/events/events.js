import './events.html';
import './style.css';
import { Events } from '../../../api/events/collections.js';
import { throwError } from '../../../api/errors/error.js';

Template.event.onCreated(function () {
	Meteor.subscribe('users',function(){
		const groupId = Meteor.user().profile.group;
		Meteor.subscribe('events', groupId);
	});
})

Template.event.helpers({
	'getEvent'(){
		const user = Meteor.user();
		const userId = user._id;
		const groupId = user.profile.group;
		const event = Events.find({group: groupId}).fetch()[0];
		if(event){
			return {
				isEventCreator: event.creator == userId,
				isParticipant: event.participants.indexOf(userId) != -1,
				isConfirmedParticipant: event.confirmedParticipants.indexOf(userId) != -1
			};
		}		
	},
	'eventData'(){
		const user = Meteor.user();
		const userId = user._id;
		const groupId = user.profile.group;
		const event = Events.find({group: groupId}).fetch()[0];
		if(event){
			return {
				status: event.status,
				numParticipants: event.confirmedParticipants.length,
				date: event.date,
				group: event.groupName,
				groupId: event.group
			};
		}	
	}
});

Template.event.events({
	'click #confirm-ev-but': function(){
		const eventId = Events.find({group: Meteor.user().profile.group}).fetch()[0]._id;
		console.log(eventId);
		Meteor.call('confirmEvent',eventId, function(err){
			if(err){
				throwError(err.error);
			}
		})
	},
	'click #refuse-ev-but': function(){
		const eventId = Events.find({group: Meteor.user().profile.group}).fetch()[0]._id;
		Meteor.call('refuseEvent',eventId, function(err){
			if(err){
				throwError(err.error);
			}
		})
	},
	'click #delete-ev-but': function(){
		const eventId = Events.find({group: Meteor.user().profile.group}).fetch()[0]._id;
		Meteor.call('deleteEvent',eventId, function(err){
			if(err){
				throwError(err.error);
			}
		})
	}
})


