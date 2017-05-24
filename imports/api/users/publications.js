import { Meteor } from 'meteor/meteor';
import { Groups} from '../groups/collections.js';

Meteor.publish("groupParticipants", function(groupId){
	const curentUser = this.userId;
	if(!curentUser){
		throw new Meteor.Error('Not autorized');
	};
	check (groupId, String);
	const group = Groups.findOne({_id: groupId});
	if(group.participants.indexOf(curentUser) == -1){
		throw new Meteor.Error('Acces denied');
	}
	const users = Meteor.users.find({
		group: {  $in: [ groupId ]  }
	});
	return users;
});
Meteor.publish("users", function(){
	const curentUser = this.userId;
	if(!curentUser){
		throw new Meteor.Error('Not autorized');
	};
	return users = Meteor.users.find({});
});