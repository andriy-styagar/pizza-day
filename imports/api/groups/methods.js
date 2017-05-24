import { Groups, Images, Menu} from './collections.js';
import { check } from 'meteor/check';

function checkAuthorisation(userId){
	if(!userId){
		throw new Meteor.Error('Not Authorized');
	}
};
function checkGroupAdmin(group, userId){
	if (group.admin != userId){
		throw new Meteor.Error('Acces denied');
	}
};
Meteor.methods({
	'createGroup'(name, logo){
		const userId = Meteor.userId();
		checkAuthorisation(userId);
		check(name, String);
		check(logo, String);
		const groupId = Groups.insert({
			name: name,
			logo: logo,
			admin: userId,
			participants: [ userId ],
			menu: []
		});
		Meteor.users.update(
			{ _id: userId },
			{ $push: { groups: groupId}});
		return groupId;	
	},
	'deleteGroup'(groupId){
		const userId = Meteor.userId();
		checkAuthorisation(userId);
		check(groupId, String);
		const group = Groups.findOne({_id: groupId});
		checkGroupAdmin(group, userId);
		const participants = group.participants;
		participants.forEach(function(id){
			Meteor.users.update(
				{ _id: id},
				{ $pull: {'groups': groupId}});
		});
		Groups.remove({_id: groupId});
	},
	'addParticapant'( userId, groupId){
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser);
		check(userId, String);
		check(groupId, String);
		const group = Groups.findOne({_id: groupId});
		checkGroupAdmin(group, curentUser);
		Groups.update({_id: groupId},
			{ $push: { participants: userId }});
		Meteor.users.update({ _id: userId },
			{ $push: {'groups': groupId }});
	},
	'removeParticipant'( userId, groupId){
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser);
		check(userId, String);
		check(groupId, String);
		const group = Groups.findOne({_id: groupId});
		checkGroupAdmin(group, curentUser);
		Groups.update({_id: groupId},
			{$pull: {participants: userId}});
		Meteor.users.update({ _id: userId },
			{ $pull: {'groups': groupId }});
		},
	'addMenuItem'(groupId, name, price){
		console.log("add menu");
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser);
		const group = Groups.findOne({_id: groupId});
		if(group.participants.indexOf(curentUser) === -1){
			throw new Meteor.Error('Acces denied');
		}
		const NonEmptyString = Match.Where((x) => {
  			check(x, String);
  			return x.length > 0;
		});
		check(name, NonEmptyString);
		if(Menu.findOne({name: name, group: groupId})){
			throw new Meteor.Error('Item exists');
		}
		if(!(price*1)){
			throw new Meteor.Error('Invalid price');
		}
		const menuId = Menu.insert({name: name, price: price, group: groupId});
		Groups.update(
			{ _id: groupId},
			{ $push: { menu: menuId }});
	},
	'removeMenuItem'(groupId, itemId){
		const curentUser = Meteor.userId();
		checkAuthorisation(curentUser);
		const group = Groups.findOne({_id: groupId});
		if(group.participants.indexOf(curentUser) == -1){
			throw new Meteor.Error('Acces denied');
		}
		check(groupId, String);
		check(itemId, String);
		Menu.remove({ _id:  itemId});
		Groups.update(
			{_id: groupId},
			{ $pull: { menu: itemId }})
	}
});