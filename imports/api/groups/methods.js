import { Groups, Images} from './collections.js';
import { check } from 'meteor/check';

Meteor.methods({
	'createGroup'(name, logo){
		check(name, String);
		check(logo, String);
		Groups.insert({
			name: name,
			logo: logo,
			admin: Meteor.userId(),
			participants: [],
			menu: []
		}, function (err, groupId) {
			if(!err){
				const userId = Meteor.userId();
				Meteor.users.update(
					{ _id: userId },
					{ $set: {
							'profile.group': groupId,
							'profile.groupAdmin': true 
						}
				});			
			};
		});
	},
	'removeGroup'(groupId){
		check(groupId, String);
		const group = Groups.find({_id: groupId}).fetch()[0];
		const arrId = group.participants;
		arrId.forEach(function(id){
			Meteor.users.update(
				{_id: id},
				{$set: {'profile.group': null}});
		});
		Meteor.users.update(
			{_id: group.admin},
			{$set: {'profile.group': null, 'profile.groupAdmin': false}});
		Groups.remove({_id: groupId});
	},
	'addParticapant'(userId,groupId){
		check(userId, String);
		check(groupId, String);
		Groups.update({_id: groupId},
			{ $push: {participants: userId }});
		Meteor.users.update({ _id: userId },
			{ $set: {'profile.group': groupId }});
		},
	'removeParticipant'(userId,groupId){
		check(userId, String);
		check(groupId, String);
		Groups.update({_id: groupId},
			{$pull: {participants: userId}});
		Meteor.users.update({ _id: userId },
			{ $set: {'profile.group': null }});
		},
	'addMenuItem'(groupId, name, price){
		if(!name){
				throw new Meteor.Error('error', 'Name may not be empty');
		}
		const menu = Groups.find({_id: groupId}).fetch()[0].menu;
		menu.forEach(function(el){
			if(name == el.name){
				throw new Meteor.Error('error', 'Item already exists');
			}
		});
		if (!price || !(price * 1)){
			throw new Meteor.Error('error','Invalid price');
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
