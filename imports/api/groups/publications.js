import { Groups, Images } from './collections.js';

Meteor.publish("groups", function(){
	return Groups.find();
});

/*Meteor.publish('images', function(){
	return Images.find();
});*/