import './confirmed-order.html';
import { Orders } from '../../../../../api/events/collections.js';

Template.confirmedOrder.onCreated(function(){
	const curentUser = Meteor.userId();
	this.subscribe('order', FlowRouter.getParam('eventId'));
});

Template.confirmedOrder.helpers({
	'isOrderingStatus'(status){
		return status === 'ordering';
	},
	'order'(){
        	return Orders.findOne({userId: Meteor.userId(), eventId: FlowRouter.getParam('eventId')});
    }
});