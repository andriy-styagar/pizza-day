import { Images, Groups } from '../../../api/groups/collections.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './create-group.html';
import './style.css';
import './groups.html';
import './group-item/group-item.js';

Template.createGroup.onCreated(function(){
	this.subscribe('groups');	
})
Template.createGroup.events({
	'click #create_group_but': function(e, t){
		e.preventDefault();
		const logo = $('input[name=group-logo]')[0].files[0];
		const groupName = $('input[name=group-name]').val();
		const logoId = Images.insert(new FS.File(logo),function(err,file){
			if(err){
				swal('', err.reason, 'error');
			}
		})._id;
		Meteor.call('createGroup', groupName, logoId,function (err) {
			if(err){
				swal('', err.reason, 'error');
			}
			else{
				FlowRouter.go('/groups');
			}
		});
	}
});

Template.groups.onCreated(function(){
	this.subscribe('groups');
});
Template.groups.helpers({
	'groups': function(){
		return Groups.find({});
	}
})