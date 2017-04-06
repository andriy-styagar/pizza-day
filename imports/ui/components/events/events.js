import './events.html';
import './style.css';
import { Events } from '../../../api/events/collections.js';


function errorHandler(err){
			if(err){
				swal('', err.error, "error");
			}
		}
Template.event.onCreated(function () {
	var instance = this;
	instance.autorun(function (argument) {
		const users = instance.subscribe('users');
		if(users.ready()){
			const groupId = Meteor.user().group;
			instance.subscribe('events',groupId);
		}
	});
	this.orderItems = new ReactiveDict();
	this.orderPrice = new ReactiveVar(0);
})

Template.event.helpers({
	
	'event'(){
		const groupId = Meteor.user().group;
		Template.instance().event = Events.find({group: groupId});
		return Template.instance().event.fetch()[0];
	},
	'eventDate'(){
		const date = Template.instance().event.fetch()[0].date;
		const formattedDate = new String(date).split(' ').slice(0,3).join(' ');
		return formattedDate;
	},
	'eventParticipants'(){
		const p =  Template.instance().event.fetch()[0].confirmedParticipants.map(function (id) {
				return Meteor.users.findOne({_id: id});
			});
		return p;
	},
	'orderedParticipants'(){
		const p =  Template.instance().event.fetch()[0].orderedParticipants.map(function (id) {
				return Meteor.users.findOne({_id: id});
			});
		return p;
	},
	'isUnconfirmedParticipant'(){
			const t = Template.instance();
			return t.event.fetch()[0].unconfirmedParticipants.indexOf(Meteor.userId()) != -1;	
	},
	'isConfirmedParticipant'(){
			const t = Template.instance();
			return t.event.fetch()[0].confirmedParticipants.indexOf(Meteor.userId()) != -1;
	},
	'isEventCreator'(){
		const t = Template.instance();
		return t.event.fetch()[0].creator == Meteor.userId();
	},
	'numParticipants'(){
		return Template.instance().event.fetch()[0].confirmedParticipants.length;
	},
	'unconfirmedOrder'(){
		const instance = Template.instance();
		const orderPrice = instance.orderPrice.get();
		const orderItems = [];
		const items = instance.orderItems.all();
		for(key in items){
			orderItems.push({name: key, price: items[key].price, num: items[key].num});
		};
		return {
			orderItems,
			orderPrice
		}
	},
	'confirmedOrder'(){
		let orderItems = [];
		let order = {};
		Template.instance().event.fetch()[0].orders.forEach(function(el){
				if(el.userId == Meteor.userId()){
					 order = el;	
			}
		});
		for(key in order.orderItems){
			orderItems.push({name: key, price: order.orderItems[key].price, num: order.orderItems[key].num});
		};
		const orderPrice = order.orderPrice;
		return {
			orderItems,
			orderPrice
		}
	},
	'isOrderedParticipant'(){
			const t = Template.instance();
			return t.event.fetch()[0].orderedParticipants.indexOf(Meteor.userId()) != -1;
	},
	'isOrderingStatus'(){
		return Template.instance().event.fetch()[0].status == 'ordering';
	}

});

Template.event.events({
	'click #confirm-ev-but': function(){
		const eventId = Events.find({group: Meteor.user().group}).fetch()[0]._id;
		Meteor.call('confirmEvent',eventId, errorHandler)
	},
	'click #refuse-ev-but': function(){
		const eventId = Events.find({group: Meteor.user().group}).fetch()[0]._id;
		Meteor.call('refuseEvent',eventId, errorHandler);
	},
	'click #delete-ev-but': function(){
		const eventId = Events.find({group: Meteor.user().group}).fetch()[0]._id;
		Meteor.call('deleteEvent',eventId, errorHandler)
	},
	'click .add-order-item-but': function(e, t){
		const name = $(e.target).attr('name');
		const price = $(e.target).attr('price');
		if(!t.orderItems.get(name)){
			t.orderItems.set(name, {price: price, num: 1});
			const newOrderPrice = t.orderPrice.get()*1 + price*1; 
			t.orderPrice.set( newOrderPrice);
		}
		else{
			const newPrice = t.orderItems.get(name).price*1 + price*1;
			const newOrderlPrice = t.orderPrice.get()*1 + price*1;
			const newNum = t.orderItems.get(name).num + 1;
			t.orderItems.set(name, {price: newPrice, num: newNum});
			t.orderPrice.set( newOrderlPrice);
		};
	},
	'click .delete-order-item-but': function (e, t) {
		const name = $(e.target).attr('name');
		const item = Template.instance().orderItems.get(name);
		const newOrderPrice = Template.instance().orderPrice.get() - (item.price / item.num)
		 
		if(item.num > 1){
			const newPrice = item.price - (item.price / item.num);
			const newNum = item.num - 1;
			t.orderItems.set(name, { price: newPrice , num: newNum});
			t.orderPrice.set(newOrderPrice);
		}
		else{
			t.orderItems.delete(name);
			t.orderPrice.set(newOrderPrice);

		}

	},
	'click #create-order-but': function (e, t) {
		const orderItems  = t.orderItems.all();
		const orderPrice = t.orderPrice.get();
		Meteor.call('createOrder',orderItems, orderPrice, Meteor.user().group, function(err){
			if (err) {
				swal('', err.reason, 'error');
			}
			
		})
	},
	'click #delete-order-but': function(e, t){
		Meteor.call('deleteOrder', Meteor.user().group, function (err) {
			if (err) {
				swal('', err.reason, 'error');
			}
		} )
	}
})


