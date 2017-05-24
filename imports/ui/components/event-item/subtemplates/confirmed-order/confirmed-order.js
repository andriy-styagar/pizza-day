import './confirmed-order.html';

Template.confirmedOrder.helpers({
	'isOrderingStatus'(status){
			return status === 'ordering';
	}
})