import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import '../../ui/layouts/body/body.js';
import '../../ui/components/users/users.js';
import '../../ui/components/groups/groups.js';
import '../../ui/components/events/events.js';


FlowRouter.route('/',{
	name: 'home',
	action: function () {
		BlazeLayout.render('main-layout',{content: "users"})
	}
});
FlowRouter.route('/create-group', {
	action: function (){
		BlazeLayout.render('main-layout', {content: 'createGroup'})
	}
});
FlowRouter.route('/groups',{
	action: function(){
		BlazeLayout.render('main-layout', {content: 'groups'})
	}
});

FlowRouter.route('/groups/:groupId',{
	name: 'groupItem',
	action: function(){
		BlazeLayout.render('main-layout', {content: 'groupItem'})
	}
})
FlowRouter.route('/events',{
	action: function(){
		BlazeLayout.render('main-layout', {content: 'event'})
	}
})