import './subtemplates/participants/participants.js';
import './subtemplates/add-participants/add-participants.js';
import './subtemplates/menu/menu.js';
import './group-item.html';
import './style.css';
import { Images, Groups } from '../../../api/groups/collections.js';

Template.groupItem.onCreated(function () {
	const instance = this;
	instance.groupId = FlowRouter.getParam('groupId');
	const group = instance.subscribe('groupItem',instance.groupId);
	instance.group = Groups.find({_id: instance.groupId});
	instance.autorun( function() {
		if(group.ready()){
			instance.subscribe('logo', instance.group.fetch()[0].logo);
		}
	});

});
Template.groupItem.helpers({
	'logoUrl'(){
		return Images.findOne({_id: Template.instance().group.fetch()[0].logo}).url();
	},
	'group'(){
		return Template.instance().group.fetch()[0];
	}
});
Template.registerHelper('curentUser', () => {
  return Meteor.userId();
});
Template.registerHelper('isGroupAdmin', ( adminId, id ) => {
  return adminId === id;
});
Template.groupItem.events({
	'click #remove-group-but': function(e, t){
		Meteor.call('deleteGroup', t.groupId, function (err) {
			if(err){
				swal('', err.reason, "error");
			}
			else
				FlowRouter.go('/');
		})
	},
	'click #create-event-but': function (e, t){
		e.preventDefault();
		Meteor.call('createEvent',t.groupId, function(err, id){
			if (err){
				swal('', err.reason, "error");
			}
			else{
				FlowRouter.go('/' + id);
			}
		});
	}	
})


	