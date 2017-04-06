import { Events } from './collections.js';
import { Match } from 'meteor/check';
import { Groups } from '../groups/collections.js';
const NonEmptyString = Match.Where((x) => {
  			check(x, String);
 			 return x.length > 0;
		});

Meteor.methods({
	'createEvent'(groupId){
		check(groupId, NonEmptyString);
		const group = Groups.findOne({_id: groupId});
		if(group.admin !== Meteor.userId()){
			throw new Meteor.Error('Acces denied');
		}
		Events.insert({
			date: new Date(),
			status: 'ordering',
			group: groupId,
			groupName: group.name,
			creator: group.admin,
			menu: group.menu,
			unconfirmedParticipants: group.participants,
			confirmedParticipants: [Meteor.userId()],
			orderedParticipants: [],
			orders: [],
			totalPrice: 0
		});
		Events.update(
			{creator: Meteor.userId()},
			{
				$pull: { unconfirmedParticipants: Meteor.userId()}
			});
	},
	'confirmEvent'(eventId){
		check(eventId, NonEmptyString);
		Events.update(
			{_id: eventId},
			{
				$push: { confirmedParticipants: Meteor.userId()},
				$pull: { unconfirmedParticipants: Meteor.userId()}
			});
	},
	'refuseEvent'(eventId){
		check(eventId, NonEmptyString);
		Events.update(
			{_id: eventId},
			{
				$pull: { unconfirmedParticipants: Meteor.userId()}
			});
	},
	'deleteEvent'(eventId){
		const event = Events.findOne({_id: eventId});
		if(event.creator != Meteor.userId()){
			throw new Meteor.Error('Acces denied');
		}
		Events.remove({_id: eventId});
	},
	'createOrder'(orderItems, orderPrice, groupId){
		check(orderItems, Object),
		check(orderPrice, Number);
		check(groupId, NonEmptyString);
		const event = Events.findOne({group: groupId});
		if(event.confirmedParticipants.indexOf(this.userId) == -1){
			throw new Meteor.Error('Acces denied');
		};
		if(orderItems == {}){
			Events.update(
			{ group: groupId},
			{ 
				$push: {orderedParticipants: userId}
			});
		}
		else{
			const orderObj = {
			userId: this.userId,
			orderItems,
			orderPrice
		};
		const userId = this.userId;
		Events.update(
			{group: groupId},
			{ 
				$push: { orders: orderObj, orderedParticipants: userId},
			 	$set: { totalPrice: event.totalPrice + orderObj.orderPrice }
			});
		const e = Events.findOne({group: groupId});
		if((e.unconfirmedParticipants.length == 0) && (e.confirmedParticipants.length == e.orderedParticipants.length)){
			Events.update(
				{ group: groupId },
				{ $set: {status: 'ordered' }});
			}
		}	
	},
	'deleteOrder'(groupId){
		const userId = this.userId;
		const event = Events.findOne({group: groupId});
		let orderPrice;
		event.orders.forEach(function (el) {
			if (el.userId == userId) {
				orderPrice = el.orderPrice;
			}
		})
		const newTotalPrice = event.totalPrice - orderPrice;
		Events.update(
			{ group: groupId },
			{ 
				$pull: {orders: {userId: userId}, orderedParticipants: userId},
				$set: { totalPrice: newTotalPrice }
			});
	}
});
