import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import {Groups, Images } from '../../api/groups/collections.js';
import '../../ui/layouts/body/body.js';
import '../../ui/components/users/users.js';
import '../../ui/components/groups/groups.js';


FlowRouter.route('/',{
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
	action: function(){
		BlazeLayout.render('main-layout', {content: 'groupItem'})
	}
})