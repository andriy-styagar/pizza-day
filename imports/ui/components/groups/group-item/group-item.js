import { FlowRouter } from 'meteor/kadira:flow-router';
import { Images, Groups } from '../../../../api/groups/collections.js';
import { Events } from '../../../../api/events/collections.js';

import './group-item.html';
function errorHandler(err){
			if(err){
				swal('', err, "error");
			}
		}

Template.groupItem.onCreated(function () {
	this.groupId = FlowRouter.getParam('groupId');
	const instance = this;
	instance.autorun(function (argument) {
		const group = instance.subscribe('groupItem',instance.groupId);
		if(group.ready()){
			const logoId =  Groups.findOne({_id: instance.groupId}).logo;
			instance.subscribe('images', logoId);
			instance.subscribe('events', instance.groupId);
		}
		instance.subscribe('users');
	});
})
Template.groupItem.helpers({
	'group'(){
		Template.instance().group = Groups.find({_id: FlowRouter.getParam('groupId')});
			return Template.instance().group.fetch()[0];
	},
	'groupParticipants'(){
			 const participants =  Meteor.users.find(
				{ $and: [
					{'group': Template.instance().groupId},
					{ $or: [
						{'groupAdmin': false },
						{"groupAdmin": { $exists: false}}] 
					}
				]},
				{ fields: {_id: 1, profile: 1 }});
			 return participants;
	},
	'addParticipantsList'(){
		const users = Meteor.users.find({ $or: [
			{"group": null},
			{"group": {$exists: false}},
			{ fields: {_id: 1, profile: 1 }}
		]});
		return users;
	},
	'isGrouppAdmin'(){
		const group = Meteor.user().group;
		return (group == Template.instance().groupId) && Meteor.user().groupAdmin;
		
	},
	'logoUrl'(){
		return Images.findOne({_id: Template.instance().group.fetch()[0].logo}).url();
	},
	'groupAdmnin'(){
		return Meteor.users.findOne({_id: Template.instance().group.fetch()[0].admin});
	},
	'isEvent'(){
		return Events.findOne({group: Template.instance().groupId});
	}
});

Template.groupItem.events({
	'click .add-participant-but': function(e, t){
		const userId = $(e.target).attr('id');
		const groupId = FlowRouter.getParam('groupId');
		Meteor.call('addParticapant', userId, groupId, errorHandler)
	},
	'click .remove-participant-but': function(e, t){
		const userId = $(e.target).attr('id');
		const groupId = FlowRouter.getParam('groupId');
		Meteor.call('removeParticipant', userId, groupId, errorHandler)
	},
	'click #remove-group-but': function(e, t){
		const groupId = FlowRouter.getParam('groupId');
		Meteor.call('removeGroup', groupId, function (err) {
			if(err){
				swal('', err.reason, "error");
			}
			else
				FlowRouter.go('/groups');
		})
	},
	'click #add-menu-but': function(e, t){
		e.preventDefault();
		const name = $('#name-of-pizza-in').val();
		const price = $('#price-in').val();
		const groupId = FlowRouter.getParam('groupId');
		Meteor.call('addMenuItem', groupId, name, price, errorHandler);
	},
	'click .remove-menu-but': function(e, t){
		e.preventDefault();
		const name =  $(e.target).attr('name');
		const groupId = FlowRouter.getParam('groupId');
		Meteor.call('removeMenuItem',groupId,name, errorHandler);
	},
	'click #create-event-but': function (e, t){
		e.preventDefault();
		const groupId = FlowRouter.getParam('groupId');
		Meteor.call('createEvent',groupId, function(err){
			if (err){
				swal('', err.reason, "error");
			}
			else{
				FlowRouter.go('/events')
			}
		});
	}	
})
