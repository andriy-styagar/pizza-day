import './event-item.html';
import './style.css';
import './subtemplates/menu/menu.js';
import './subtemplates/participants/participants.js';
import './subtemplates/unconfirmed-order/unconfirmed-order.js';
import './subtemplates/confirmed-order/confirmed-order.js';
import { Events } from '../../../api/events/collections.js';
import { errorHandler } from '../error-handler.js'; 

Template.eventItem.onCreated(function () {
	var instance = this;
	instance.eventId = FlowRouter.getParam('eventId');
	const event = instance.subscribe('eventItem', instance.eventId);
	instance.event = Events.find({_id: instance.eventId});
	instance.autorun(function () {
		if(event.ready()){
			instance.subscribe('menu', instance.event.fetch()[0].group);
		}
		instance.subscribe('eventParticipants', instance.eventId);	
	});
	instance.order = new ReactiveDict();
});
Template.eventItem.helpers({
	'event'(){
		return Template.instance().event.fetch()[0];
	},
	'isUnconfirmedParticipant'(){
			return Template.instance().event.fetch()[0].
				unconfirmedParticipants.indexOf(Meteor.userId()) !== -1;	
	},
	'isConfirmedParticipant'(){
			return Template.instance().event.fetch()[0].
				confirmedParticipants.indexOf(Meteor.userId()) !== -1;
	},
	'numParticipants'(){
		return Template.instance().event.fetch()[0].confirmedParticipants.length;
	},
	'isEventCreator'(){
		return Template.instance().event.fetch()[0].creator === Meteor.userId();
	},
	'isOrderedParticipant'(){
			return Template.instance().event.fetch()[0].
				orderedParticipants.indexOf(Meteor.userId()) !== -1;
	},
	'unconfirmedOrderData'(){
		return Template.instance().order.all();
	},
	'confirmedOrderData'(){
		const orders = Template.instance().event.fetch()[0].orders;
		const order =  orders.filter(function (el) {
			return el.userId === Meteor.userId();
		});
		return order[0];
	}
});
Template.eventItem.events({
	'click .confirm-ev-but': function(e, t){
		const val = $(e.target).attr('val');
		Meteor.call('confirmEvent',t.eventId, val, errorHandler)
	},
	'click #delete-ev-but': function(e, t){
		Meteor.call('deleteEvent',t.eventId, errorHandler);
		FlowRouter.go('/');
	},
	'click .add-order-item-but': function(e, t){
		const id = $(e.target).attr('id');
		const itemPrice = $(e.target).attr('price');
		const name = $(e.target).attr('name');
		if(!t.order.get('orderPrice')){
			t.order.set('orderPrice', itemPrice);
		}
		else{
			const newOrderPrice = t.order.get('orderPrice')*1 + itemPrice*1; 
			t.order.set('orderPrice', newOrderPrice);
		}
		if(!t.order.get(id)){
			t.order.set(id, {name, num: 1, itemPrice, price: itemPrice});
		}
		else{
			const newNum = t.order.get(id).num + 1;
			t.order.set(id, {name, num: newNum, itemPrice, price: newNum*itemPrice});
		};
	},
	'click .delete-order-item-but': function (e, t) {
		const id = $(e.target).attr('id');
		const itemPrice = t.order.get(id).itemPrice;
		const num = t.order.get(id).num;
		const name = t.order.get(id).name;
		const price = t.order.get(id).price;
		const orderPrice = t.order.get('orderPrice');
		const newOrderPrice = orderPrice - itemPrice;
		if(num > 1){
			const newNum = num - 1;
			t.order.set(id, {name, num: newNum, itemPrice,  price: price - itemPrice});
			t.order.set('orderPrice', newOrderPrice);
		}
		else{
			t.order.delete(id);
			t.order.set('orderPrice', newOrderPrice);
		}

	},
	'click #create-order-but': function (e, t) {
		const orderData  = t.order.all();
		if(Object.keys(orderData).length <= 1)
			swal('', 'Order is empty', 'error')
		else
			Meteor.call('createOrder',orderData , t.eventId, errorHandler);
	},
	'click #delete-order-but': function(e, t){
		Meteor.call('deleteOrder', t.eventId, errorHandler);
	},
	'click #change-st-but': function (e, t) {
			Meteor.call('changeStatus', t.eventId, errorHandler);
	}
});
