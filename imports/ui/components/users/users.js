import './users.html';

Template.users.onCreated(){
	this.subscribe("users");
}

Template.users.helpers({
	users: function(){
		const users = Meteor.users.find().fetch();
		
		if
		return 
	}
})