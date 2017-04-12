import { Events } from './collections.js';
import { Match } from 'meteor/check';
import { Groups } from '../groups/collections.js';
import { Email } from 'meteor/email';
import { SSR } from 'meteor/meteorhacks:ssr';
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
		const e = Events.findOne({_id: eventId});
		if((e.unconfirmedParticipants.length == 0) && (e.confirmedParticipants.length == e.orderedParticipants.length)){
			Events.update(
				{ _id: eventId },
				{ $set: {status: 'ordered' }});
				Meteor.call('sendEmails', eventId);
		}
	},
	'deleteEvent'(eventId){
		const event = Events.findOne({_id: eventId});
		if(event.creator != Meteor.userId()){
			throw new Meteor.Error('Acces denied');
		}
		Events.remove({_id: eventId});
	},
	'createOrder'(orderItems, orderPrice, eventId){
		check(orderItems, Object),
		check(orderPrice, Number);
		check(eventId, NonEmptyString);
		const event = Events.findOne({_id: eventId});
		if(event.confirmedParticipants.indexOf(this.userId) == -1){
			throw new Meteor.Error('Acces denied');
		};
		if(orderItems == {}){
			Events.update(
			{ _id: eventId},
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
				{_id: eventId},
				{ 
					$push: { orders: orderObj, orderedParticipants: userId},
			 		$set: { totalPrice: event.totalPrice + orderObj.orderPrice }
				});
			const e = Events.findOne({_id: eventId});
			if((e.unconfirmedParticipants.length == 0) && (e.confirmedParticipants.length == e.orderedParticipants.length)){
				Events.update(
					{ _id: eventId },
					{ $set: {status: 'ordered' }});
					Meteor.call('sendEmails', eventId);
				}
			}	
	},
	'deleteOrder'(eventId){
		const userId = this.userId;
		const event = Events.findOne({_id: eventId});
		let orderPrice;
		event.orders.forEach(function (el) {
			if (el.userId == userId) {
				orderPrice = el.orderPrice;
			}
		})
		const newTotalPrice = event.totalPrice - orderPrice;
		Events.update(
			{ _id: eventId },
			{ 
				$pull: {orders: {userId: userId}, orderedParticipants: userId},
				$set: { totalPrice: newTotalPrice }
			});
	},
	'sendEmails'(eventId){
		const event = Events.findOne({_id: eventId});
		const orders = event.orders;
		const eventCreator = event.creator;
		SSR.compileTemplate('htmlUserEmail', Assets.getText('user-mail.html'));
		SSR.compileTemplate('htmlAdminEmail', Assets.getText('admin-mail.html'));
		let allOrdersItems = {};
		let adminOrder = {orderItems: [], orderPrice: 0};
		let adminEmail = '';
		orders.forEach(function(order){
			if(order.userId != event.creator){
				let orderItems = [];
				for(key in order.orderItems){
					if(allOrdersItems[key]){
						allOrdersItems[key].num += order.orderItems[key].num;
					}
					else{
						allOrdersItems[key] = {name: key, num: order.orderItems[key].num}
					}
					orderItems.push({name: key, num: order.orderItems[key].num, price: order.orderItems[key].price})
				};
				const user = Meteor.users.findOne({_id: order.userId});
				if(user.emails){
					emailAdd = user.emails[0].address;
				}
				else{
					emailAdd = user.services.google.email
				}
				Email.send({
  					to: emailAdd,
  					from: "pizza-day@email.com",
  					subject: "Your Order",
  					html: SSR.render('htmlUserEmail', { orderItems, orderPrice: order.orderPrice}),
				});
			}
			else{
				for(key in order.orderItems){
					if(allOrdersItems[key]){
						allOrdersItems[key].num += order.orderItems[key].num;
					}
					else{
						allOrdersItems[key] = {name: key, num: order.orderItems[key].num}
					}
					adminOrder.orderItems.push({name: key, num: order.orderItems[key].num, price: order.orderItems[key].price})
				};
				adminOrder.orderPrice = order.orderPrice;
				const user = Meteor.users.findOne({_id: order.userId});
				if(user.emails){
					adminEmail = user.emails[0].address;
				}
				else{
					adminEmail = user.services.google.email
				}
			}
		});
		let arrOfAllItems = [];
		for(key in allOrdersItems){
			arrOfAllItems.push(allOrdersItems[key]);
		}
		const totalPrice = event.totalPrice;
		Email.send({
  					to: adminEmail,
  					from: "pizza-day@email.com",
  					subject: "Your Order",
  					html: SSR.render('htmlAdminEmail', { adminOrder, arrOfAllItems,  totalPrice})
		});
	},
	'changeStatus'(eventId){
		if(Events.findOne({_id: eventId}).creator != this.userId){
			throw new Meteor.Error('Acces Denied');
		};
		const event = Events.findOne({_id: eventId});
		const status = event.status;
		switch(status){
			case 'ordered':
				Events.update({_id: eventId},{ $set: {status: 'delivering'}});
				break;
			case 'delivering':
				Events.update({_id: eventId},{ $set: {status: 'delivered'}});
				break;
		}
	}
});
