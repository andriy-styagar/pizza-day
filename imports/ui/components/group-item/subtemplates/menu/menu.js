import './menu.html';
import { Menu } from '../../../../../api/groups/collections.js';
import { errorHandler } from '../../../error-handler.js';

Template.menu.onCreated(function () {
	this.groupId = FlowRouter.getParam('groupId');
	this.subscribe('menu', this.groupId);
});

Template.menu.helpers({
	'menu'(){
		return Menu.find({group: Template.instance().groupId});
	}
});
Template.menu.events({
	'click #add-menu-but': function(e, t){
		e.preventDefault();
		const name = $('#name-of-pizza-in').val();
		const price = $('#price-in').val();
		Meteor.call('addMenuItem', t.groupId, name, price, errorHandler);
	},
	'click .remove-menu-but': function(e, t){
		e.preventDefault();
		const itemId =  $(e.target).attr('item-id');
		Meteor.call('removeMenuItem', t.groupId, itemId, errorHandler);
	},
});
