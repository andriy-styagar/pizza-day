import { Events, Orders } from './collections.js';
import { Groups } from '../groups/collections.js';

function checkAuthorisation(userId){
	if(!userId){
		throw new Meteor.Error('Not Authorized');
	}
}
function checkEventParticipation(participants, userId){
	if(participants.indexOf(userId) === -1){
			throw new Meteor.Error('Acces denied');
	};
}
function checkEventCreator(adminId, userId){
    if(adminId != userId){
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
		checkEventParticipation(event.unconfirmedParticipants, curentUser);
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
        	checkEventCreator(event.creator, curentUser);
		Orders.remove({_id: {$in: event.orders}});
		Events.remove({_id: eventId});
	},
	'createOrder'(orderItems, orderPrice, eventId){
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser);
		check(eventId, String);
		check(orderPrice, Number);
		const event = Events.findOne({_id: eventId});
		checkEventParticipation(event.confirmedParticipants, curentUser)
		if(orderItems.length === 0){
			Events.update(
				{ _id: eventId },
				{ 
					$push: { orderedParticipants: curentUser}
				});	
		}
		else{
			const orderId = Orders.insert({ orderPrice, orderItems, userId: curentUser, eventId });
			const newTotalPrice = parseFloat(event.totalPrice) + parseFloat(orderPrice);
			Events.update(
				{_id: eventId},
				{ 
					$push: { orders: orderId, orderedParticipants: curentUser},
			 		$set: { totalPrice:  newTotalPrice}
				});
		}
		Meteor.call('checkOrderedStatus', eventId);
	},
	'checkOrderedStatus'(eventId){
		const curentUser = this.userId;
		checkAuthorisation(curentUser);
		const event = Events.findOne({_id: eventId});
		checkEventParticipation(event.confirmedParticipants, curentUser)
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
		checkEventParticipation(event.confirmedParticipants, curentUser)
		const orders = Orders.find({_id: {$in: event.orders }}).fetch();
		const eventCreator = event.creator;
		SSR.compileTemplate('htmlUserEmail', Assets.getText('user-mail.html'));
		SSR.compileTemplate('htmlAdminEmail', Assets.getText('admin-mail.html'));
		let totalOrder = {};
		let adminOrder = null;
		let adminEmailAdd = null;
		function getEmail(user) {
            		if(user.emails)
            			return user.emails[0].address;
           		 else
            			return user.services.google.email
       		};
		function addToTotalOrder(totalOrder, order){
			return order.orderItems.reduce(function (totalOrder, item) {
                		if(totalOrder[item.name])
                			totalOrder[item.name] += item.num
                		else
                			totalOrder[item.name] = item.num;
                		return totalOrder;

            		}, totalOrder);
		};
        	orders.forEach(function (order) {
           		totalOrder = addToTotalOrder(totalOrder, order);
			const user = Meteor.users.findOne({_id: order.userId});
            		let emailAdd = getEmail(user);
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
		for(key in totalOrder){
			arrOfAllItems.push({name: key, num: totalOrder[key]});
		}
		Email.send({
  			to: adminEmailAdd,
  			from: "pizza-day@email.com",
  			subject: "Your Order",
  			html: SSR.render('htmlAdminEmail', { adminOrder, arrOfAllItems,  totalPrice: event.totalPrice})
		});	
	},
	'deleteOrder'(eventId){
		const curentUser = this.userId;
		checkAuthorisation(curentUser);
		const event = Events.findOne({ _id: eventId });
       		checkEventParticipation(event.orderedParticipants, curentUser);
        	if(event.status !== 'ordering'){
			throw new Meteor.Error('Order can not be removed');
		};
		const order = Orders.findOne({userId: curentUser});
		const orderId = order._id;
		const newTotalPrice = event.totalPrice - order.orderPrice;
		Events.update(
			{ _id: eventId },
			{ 
				$pull: { orders: orderId , orderedParticipants: curentUser},
				$set: { totalPrice: newTotalPrice }
			});
		Orders.remove({_id: orderId});
	},
	'changeStatus'(eventId){
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser);
		const event = Events.findOne({_id: eventId});
        	checkEventCreator(event.creator, curentUser);
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