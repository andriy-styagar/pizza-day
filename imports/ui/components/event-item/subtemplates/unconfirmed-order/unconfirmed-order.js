import './unconfirmed-order.html'

Template.unconfirmedOrder.helpers({
	'order': function(orderData){
		const orderItems = [];
		let orderPrice = 0;
		for(key in orderData){
			if(key === 'orderPrice'){
				orderPrice = orderData[key];
				continue;
			}
			const itemObj = {};
			itemObj.name = orderData[key].name;
			itemObj.num = orderData[key].num;
			itemObj.price = orderData[key].price;
			itemObj.id = key;
			orderItems.push(itemObj);
		}
		return {
			orderItems,
			orderPrice
		}
	}
})

