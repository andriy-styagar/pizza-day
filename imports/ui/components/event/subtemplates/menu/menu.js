import './menu.html';
import { Menu } from '../../../../../api/groups/collections.js';

Template.eventMenu.onCreated(function () {
	this.orderItems = new ReactiveDict();
	this.orderPrice = new ReactiveVar(0);
});

Template.eventMenu.helpers({
	'menu'(groupId){
		return Menu.find({group: groupId});
	}
}) 