import { Meteor } from 'meteor/meteor';
import { Groups, Images, Menu } from './collections.js';

function checkAuthorisation(userId){
	if(!userId){
		throw new Meteor.Error('Not Authorized');
	}
};
Meteor.publish('groups', function(){
	const curentUser = this.userId;
	checkAuthorisation(curentUser);
	const groups = Meteor.users.findOne({_id: curentUser}).groups;
	return  Groups.find(
		{_id: {$in: groups}},
		{ _id: 1, name: 1 })
});
Meteor.publish('groupItem', function(id){
	const curentUser = this.userId;
	checkAuthorisation(curentUser);
	if(Meteor.users.findOne(curentUser).groups.indexOf(id) === -1){
		throw new Meteor.Error('Acces denied');
	}
	return Groups.find({_id: id});
});
Meteor.publish('logo', function(id){
	const curentUser = this.userId;
	checkAuthorisation(curentUser);
	return Images.find({_id: id});
});
Meteor.publish('menu',function (groupId) {
	const curentUser = this.userId;
	checkAuthorisation(curentUser);
	if(Meteor.users.findOne(curentUser).groups.indexOf(groupId) === -1){
		throw new Meteor.Error('Acces denied');
	}
	return Menu.find({ group: groupId });
}) 