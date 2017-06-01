import { Events, Orders } from './collections.js';
function checkAuthorisation(userId){
	if(!userId){
		throw new Meteor.Error('Not Authorized');
	}
};
Meteor.publish('events', function(){
	const curentUser = this.userId;
	checkAuthorisation(curentUser);
	return  Events.find(
		{
			$or: [ 
				{ unconfirmedParticipants: { $in: [curentUser] }}, 
			 	{ confirmedParticipants: { $in: [curentUser] }}
			 ]
		},
		{ _id: 1, groupName: 1, status: 1, date: 1})
});
Meteor.publish('eventItem', function(eventId){
	const curentUser = this.userId;
	checkAuthorisation(curentUser);
	const eventCursor = Events.find({_id: eventId});
	const event = eventCursor.fetch()[0];
	if(event.unconfirmedParticipants.indexOf(curentUser) === -1 && 
		event.confirmedParticipants.indexOf(curentUser) === -1){
			throw new Meteor.Error('Acces denied');
	}
	return  eventCursor;
});
Meteor.publish('eventParticipants', function(eventId){
	const curentUser = this.userId;
	checkAuthorisation(curentUser);
	const event = Events.findOne({_id: eventId});
	if(event.unconfirmedParticipants.indexOf(curentUser) === -1 && 
		event.confirmedParticipants.indexOf(curentUser) === -1){
			throw new Meteor.Error('Acces denied');
	}
	return  Meteor.users.find({_id: {$in: event.confirmedParticipants}});
});
Meteor.publish('order', function(eventId){
    const curentUser = this.userId;
    checkAuthorisation(curentUser);
    return  Orders.find({userId: curentUser, eventId: eventId});
});