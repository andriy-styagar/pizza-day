import { FlowRouter } from 'meteor/kadira:flow-router';
import { Images, Groups } from '../../../../api/groups/collections.js';
import './group-item.html';

Template.groupItem.onCreated(function () {
	const groupId = FlowRouter.getParam('groupId');
	this.subscribe('groupItem', groupId, function(){
			const group = Groups.find({_id: FlowRouter.getParam('groupId')}).fetch()[0];
			Meteor.subscribe('images', group.logo);
	});
})
Template.groupItem.helpers({
	'groupData'(){
		const group = Groups.find({_id: FlowRouter.getParam('groupId')}).fetch()[0];
		const data = {};
		data.name = group.name;
		data.logoUrl = Images.find({_id: group.logo}).fetch()[0].url();
		return data
	},
	'idGrouppAdmin'(){
		const profile = Meteor.user().profile;
		return profile.group == FlowRouter.getParam('groupId') && profile.groupAdmin;
	}
})