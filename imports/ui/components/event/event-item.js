import './event-item.html';
import './style.css';
import './subtemplates/menu/menu.js';
import './subtemplates/participants/participants.js';
import './subtemplates/unconfirmed-order/unconfirmed-order.js';
import './subtemplates/confirmed-order/confirmed-order.js';
import { errorHandler } from '../error-handler.js';
import { Events } from '../../../api/events/collections.js';

Template.eventItem.onCreated(function () {
    this.orderItems = new Mongo.Collection(null);
    this.orderPrice = new ReactiveVar(0);
    this.eventId = FlowRouter.getParam('eventId');
})


Template.eventItem.helpers({
	'isUnconfirmedParticipant'(event){
			return event.unconfirmedParticipants.indexOf(Meteor.userId()) !== -1;
	},
	'isConfirmedParticipant'(event){
			return event.confirmedParticipants.indexOf(Meteor.userId()) !== -1;
	},
	'numParticipants'(event){
		return event.confirmedParticipants.length;
	},
	'isEventCreator'(event){
		return event.creator === Meteor.userId();
	},
	'isOrderedParticipant'(event){
		return event.orderedParticipants.indexOf(Meteor.userId()) !== -1;
	},
	'unconfirmedOrderItems'(){
		return Template.instance().orderItems.find({eventId: Template.instance().eventId});
	},
	'unconfirmedOrderPrice'(){
        return Template.instance().orderPrice.get();
    }
});
Template.eventItem.events({
	'click .confirm-ev-but': function(e, t){
		const val = $(e.target).attr('val');
		Meteor.call('confirmEvent',t.eventId, val, function (err) {
			if(err){
                FlowRouter.go('/');
            }
        })
	},
	'click #delete-ev-but': function(e, t){
		Meteor.call('deleteEvent',t.eventId, errorHandler);
		FlowRouter.go('/');
	},
	'click .add-order-item-but': function(e, t){
		const name = $(e.target).attr('name');
		const itemPrice = parseFloat($(e.target).attr('price'));
		const orderPrice = parseFloat(t.orderPrice.get());
        const orderItems = t.orderItems;
		const orderItem = orderItems.findOne({name: name, eventId: t.eventId});
		if(!orderItem){
			orderItems.insert({name, itemPrice, price: itemPrice , num: 1, eventId: t.eventId});
		}
		else{
			const newPrice = parseFloat(orderItem.price) + itemPrice;
			orderItems.update(
				{ name: name },
				{ $inc: { num: 1 }, $set: { price: newPrice}}
			);
		}
        t.orderPrice.set(orderPrice + itemPrice);
	},
	'click .delete-order-item-but': function (e, t) {
		const name = $(e.target).attr('name');
		const orderItem = t.orderItems.findOne({name: name, eventId: t.eventId});
		const itemPrice = orderItem.itemPrice;
        	const orderPrice = parseFloat(t.orderPrice.get());
        	if(orderItem.num > 1){
            		const newPrice = orderItem.price - itemPrice;
            		t.orderItems.update(
                		{ name: name, eventId: t.eventId },
            			{ $inc: { num: -1 }, $set: { price: newPrice}}
        		);
		}
		else{
            		t.orderItems.remove({name: name});
        	}
        	t.orderPrice.set(orderPrice - itemPrice);
	},
	'click #create-order-but': function (e, t) {
		const orderItems  = t.orderItems.find({eventId: t.eventId},{_id: 0, name: 1, price: 1, num: 1}).fetch();
		const orderPrice = t.orderPrice.get();
		if(orderItems.length == 0)
			swal('', 'Order is empty', 'error')
		else
			Meteor.call('createOrder', orderItems, orderPrice, t.eventId, errorHandler);
	},
	'click #delete-order-but': function(e, t){
		Meteor.call('deleteOrder', t.eventId, errorHandler);
	},
	'click #change-st-but': function (e, t) {
		Meteor.call('changeStatus', t.eventId, errorHandler);
	}
});
