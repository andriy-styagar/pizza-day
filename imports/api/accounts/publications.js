import { Meteor } from 'meteor/meteor';

Meteor.publish("users", function(){
	return Meteor.users.find({} ,
	  { fields: {'profile': 1, 'group': 1, 'groupAdmin': 1} } );
});
