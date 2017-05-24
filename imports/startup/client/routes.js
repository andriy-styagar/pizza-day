import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../ui/layouts/body/body.js';
import '../../ui/components/create-group/create-group.js';
import '../../ui/components/groups/groups.js';
import '../../ui/components/group-item/group-item.js';
import '../../ui/components/events/events.js';
import '../../ui/components/event-item/event-item.js';

FlowRouter.route('/create-group', {
	action: function (){
		BlazeLayout.render('App_body', { main: 'createGroup'})
	}
});
FlowRouter.route('/groups', {
  name: 'App.home',
  action() {
    	BlazeLayout.render('App_body', { main: 'groups' });
  },
});
FlowRouter.route('/', {
	action: function (){
		BlazeLayout.render('App_body', { main: 'events'})
	}
});
FlowRouter.route('/groups/:groupId',{
	action: function(){
		BlazeLayout.render('App_body', { main: 'groupItem'})
	}
});
FlowRouter.route('/:eventId',{
	action: function(){
		BlazeLayout.render('App_body', { main: 'eventItem'})
	}
});