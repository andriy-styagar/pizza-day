import './participants.html';

Template.eventParticipants.helpers({
	'eventParticipants'(participants){
		return Meteor.users.find(
			{ _id: { $in: participants}},
			{ _id: 1, profile: 1 });
	}
});