import { Groups, Images} from './collections.js';
import { check } from 'meteor/check';

Meteor.methods({
	'createGroup'(name, logo){
		check(name, String);
		check(logo, String);
		const groupId = Groups.insert({
			name: name,
			logo: logo,
			admin: Meteor.userId(),
			participants: [Meteor.userId()],
			menu: []
		});
		const userId = Meteor.userId();
		Meteor.users.update(
					{ _id: userId },
					{ $set: {
							'group': groupId,
							'groupAdmin': true 
						}
				});		
	},
	'removeGroup'(groupId){
		check(groupId, String);
		const group = Groups.find({_id: groupId}).fetch()[0];
		if (group.admin != Meteor.userId()){
			throw new Meteor.Error('Acces denied');
		}
		const participants = group.participants;
		participants.forEach(function(id){
			Meteor.users.update(
				{_id: id},
				{$set: {'group': null}});
		});
		Meteor.users.update(
			{_id: group.admin},
			{$set: {'group': null, 'groupAdmin': false}});
		Groups.remove({_id: groupId});
	},
	'addParticapant'(userId,groupId){
		check(userId, String);
		check(groupId, String);
		const group = Groups.find({_id: groupId}).fetch()[0];
		if (group.admin != Meteor.userId()){
			throw new Meteor.Error('Acces denied');
		}
		Groups.update({_id: groupId},
			{ $push: {participants: userId }});
		Meteor.users.update({ _id: userId },
			{ $set: {'group': groupId }});
		},
	'removeParticipant'(userId,groupId){
		check(userId, String);
		check(groupId, String);
		const group = Groups.find({_id: groupId}).fetch()[0];
		if (group.admin != Meteor.userId()){
			throw new Meteor.Error('Acces denied');
		}
		Groups.update({_id: groupId},
			{$pull: {participants: userId}});
		Meteor.users.update({ _id: userId },
			{ $set: {'group': null }});
		},
	'addMenuItem'(groupId, name, price){
		check(name, String);
		const menu = Groups.find({_id: groupId}).fetch()[0].menu;
		menu.forEach(function(el){
			if(name == el.name){
				throw new Meteor.Error('Item already exists');
			}
		});
		if(!(price*1)){
				throw new Meteor.Error('Invalid price');
		};
		Groups.update(
			{_id: groupId},
			{$push: {menu: {name: name, price: price}}});
	},
	'removeMenuItem'(groupId, name){
		check(groupId, String);
		check(name, String);
		Groups.update(
		{_id:  groupId},
		{$pull: {menu: {name: name}}});
	}
	
});
