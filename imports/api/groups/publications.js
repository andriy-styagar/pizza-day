import { Groups, Images } from './collections.js';

Meteor.publish("groups", function(){
	if(this.userId)
		return Groups.find();
});

Meteor.publish('images', function(id){
	return Images.find({_id: id});
});

Meteor.publish('groupItem', function(id){
	return Groups.find({_id: id});
});