import './subtemplates/participants/participants.js';
import './subtemplates/add-participants/add-participants.js';
import './subtemplates/menu/menu.js';
import './group-item.html';
import './style.css';

Template.groupItem.onCreated(function () {
    this.groupId = FlowRouter.getParam('groupId');
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
				FlowRouter.go('/groups');
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


	