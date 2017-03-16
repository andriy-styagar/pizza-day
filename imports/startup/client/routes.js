import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../ui/layouts/body/body.js';
import '../../ui/components/users/users.js';

FlowRouter.route('/',{
	action: function (argument) {
		BlazeLayout.render('main',{content: "users"})
	}
});
