import './users.html';
import { Template } from 'meteor/templating';

Template.users.onCreated(function(){
	this.subscribe("users");
});

Template.users.helpers({
	users: function(){
		return Meteor.users.find();
	}
})