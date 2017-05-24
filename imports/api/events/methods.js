import { Events } from './collections.js';
import { Groups } from '../groups/collections.js';

function checkAuthorisation(userId){
	if(!userId){
		throw new Meteor.Error('Not Authorized');
	}
}
function checkEventParticipation(event, userId){
	if(event.confirmedParticipants.indexOf(userId) === -1){
			throw new Meteor.Error('Acces denied');
	};
}
Meteor.methods({
	'createEvent'(groupId){
		const curentUser = this.userId;
		checkAuthorisation(curentUser);
		check(groupId, String);
		const group = Groups.findOne({_id: groupId});
		if(group.participants.indexOf(curentUser) === -1){
			throw new Meteor.Error('Acces denied');
		}
		const unconfirmedParticipants = group.participants;
		const indAdminId = unconfirmedParticipants.indexOf(curentUser);
		unconfirmedParticipants.splice(indAdminId, 1);
		const eventId = Events.insert({
			date: new Date().toString(),
			status: 'ordering',
			group: groupId,
			groupName: group.name,
			creator: curentUser,
			menu: group.menu,
			unconfirmedParticipants: unconfirmedParticipants,
			confirmedParticipants: [ curentUser ],
			orderedParticipants: [],
			orders: [],
			totalPrice: 0
		});
		return eventId;
	},
	'confirmEvent'(eventId, val){
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser)		
		check(eventId, String);
		const event = Events.findOne({ _id: eventId });
		if(event.unconfirmedParticipants.indexOf(curentUser) == -1){
			throw new Meteor.Error('Acces Denied');
		}
		if(val === 'confirm'){
			Events.update(
			{_id: eventId},
			{
				$push: { confirmedParticipants: curentUser},
				$pull: { unconfirmedParticipants: curentUser}
			});
		}
		else{
			Events.update(
			{_id: eventId},
			{
				$pull: { unconfirmedParticipants: curentUser}
			});
			Meteor.call('checkOrderedStatus', eventId);
		}	
	},
	'deleteEvent'(eventId){
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser)
		const event = Events.findOne({_id: eventId});
		if(event.creator != curentUser){
			throw new Meteor.Error('Acces denied');
		}
		Events.remove({_id: eventId});
	},
	'createOrder'(order, eventId){
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser);
		check(order, Object),
		check(eventId, String);
		const event = Events.findOne({_id: eventId});
		checkEventParticipation(event, curentUser)
		if(order === null || Object.keys(order).length <= 1){
			Events.update(
				{ _id: eventId },
				{ 
					$push: { orderedParticipants: curentUser}
				});	
		}
		else{
			const orderItems = [];
			for(key in order){
				if(key === 'orderPrice'){
					continue;
				}
				orderItems.push(order[key]);
			}
			const orderObj = {orderPrice: order.orderPrice, orderItems, userId: curentUser};
			Events.update(
				{_id: eventId},
				{ 
					$push: { orders: orderObj, orderedParticipants: curentUser},
			 		$set: { totalPrice: event.totalPrice + order.orderPrice }
				});
		}
		Meteor.call('checkOrderedStatus', eventId);	
	},
	'checkOrderedStatus'(eventId){
		const curentUser = this.userId;
		checkAuthorisation(curentUser);
		const event = Events.findOne({_id: eventId});
		checkEventParticipation(event, curentUser)
		if((event.unconfirmedParticipants.length === 0) && (event.confirmedParticipants.length === event.orderedParticipants.length)){
			Events.update(
				{ _id: eventId },
				{ $set: { status: 'ordered' }});
			Meteor.call('sendEmails', eventId);
		}
	},
	'sendEmails'(eventId){
		const curentUser = this.userId;
		checkAuthorisation(curentUser);
		const event = Events.findOne({_id: eventId});
		checkEventParticipation(event, curentUser)
		const orders = event.orders;
		const eventCreator = event.creator;
		SSR.compileTemplate('htmlUserEmail', Assets.getText('user-mail.html'));
		SSR.compileTemplate('htmlAdminEmail', Assets.getText('admin-mail.html'));
		const allOrdersItems = {};
		let adminOrder = null;
		let adminEmailAdd = null;
		orders.forEach(function (order) {
			order.orderItems.forEach(function (item) {
				if(allOrdersItems[item.name])
					allOrdersItems[item.name] += item.num
				else
					allOrdersItems[item.name] = item.num;
			});
			const user = Meteor.users.findOne({_id: order.userId});
			if(user.emails)
				emailAdd = user.emails[0].address;
			else
				emailAdd = user.services.google.email
			if(order.userId === eventCreator){
				adminOrder = order;
				adminEmailAdd = emailAdd;
			}
			else{
				Email.send({
  					to: emailAdd,
  					from: "pizza-day@email.com",
  					subject: "Your Order",
  					html: SSR.render('htmlUserEmail', { orderItems: order.orderItems, orderPrice: order.orderPrice}),
				});
			}
		});
		let arrOfAllItems = [];
		for(key in allOrdersItems){
			arrOfAllItems.push({name: key, num: allOrdersItems[key]});
		}
		const totalPrice = event.totalPrice;
		Email.send({
  			to: adminEmailAdd,
  			from: "pizza-day@email.com",
  			subject: "Your Order",
  			html: SSR.render('htmlAdminEmail', { adminOrder, arrOfAllItems,  totalPrice})
		});	
	},
	'deleteOrder'(eventId){
		const curentUser = this.userId;
		checkAuthorisation(curentUser);
		const event = Events.findOne({ _id: eventId });
		if(event.status !== 'ordering'){
			throw new Meteor.Error('orders can not be removed');
		};
		if(event.orderedParticipants.indexOf(curentUser) === -1){
			throw new Meteor.Error('Acces Denied');
		};
		let orderPrice = null;
		event.orders.forEach(function (el) {
			if (el.userId == curentUser) {
				orderPrice = el.orderPrice;
			}
		})
		const newTotalPrice = event.totalPrice - orderPrice;
		Events.update(
			{ _id: eventId },
			{ 
				$pull: {orders: {userId: curentUser}, orderedParticipants: curentUser},
				$set: { totalPrice: newTotalPrice }
			});
	},
	'changeStatus'(eventId){
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser);
		const event = Events.findOne({_id: eventId});
		if(event.creator != curentUser){
			throw new Meteor.Error('Acces denied');
		};
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