import { Events } from './collections.js';
import { Match } from 'meteor/check';
const pattern = Match.Where(function (arg){
	return (Match.test(arg, String)) && (arg.length > 0);
});
Meteor.methods({
	'createEvent'(groupId){
		if(!Match.test(groupId, pattern)){
			throw new Meteor.Error('Error creating event');
		}
		const group = Groups.find({_id: groupId}).fetch()[0];
		const participants = group.participants;
		const admin = group.admin;
		console.log(admin);
		Events.insert({
			date: (new Date()).toString().split(' ').splice(1,3).join(' '),
			status: 'ordering',
			group: groupId,
			groupName: group.name,
			creator: admin,
			participants: participants,
			confirmedParticipants: [],
			orderedParticipants: [],
			orders: [],
			totaiPrice: 0
		});
		Events.update(
			{creator: Meteor.userId()},
			{
				$push: { confirmedParticipants: Meteor.userId()},
				$pull: { participants: Meteor.userId()}
			});
	},
	'confirmEvent'(eventId){
		if(!Match.test(eventId, pattern)){
			throw new Meteor.Error('Error creating event');
		}
		Events.update(
			{_id: eventId},
			{
				$push: { confirmedParticipants: Meteor.userId()},
				$pull: { participants: Meteor.userId()}
			});
	},
	'refuseEvent'(eventId){
		if(!Match.test(eventId, pattern)){
			throw new Meteor.Error('Error creating event');
		}
		Events.update(
			{_id: eventId},
			{
				$pull: { participants: Meteor.userId()}
			});
	},
	'deleteEvent'(eventId){
		Events.remove({_id: eventId});
	},
	'clearUnconfirmedParticipants'(eventId){
		if(!Match.test(eventId, pattern)){
			throw new Meteor.Error('Error creating event');
		}
		Events.update(
			{_id: eventId},
			{
				$set: {'participants': [] }
			});
	}
})