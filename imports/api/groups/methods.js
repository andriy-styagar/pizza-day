import { Groups, Images} from './collections.js';
import { check } from 'meteor/check';

Meteor.methods({
	'createGroup'(name, logo){
		check(name, String);
		check(logo, String);
		Groups.insert({
			name: name,
			logo: logo,
			admin: Meteor.userId(),
			participants: [],
			menu: []
		}, function (err, groupId) {
			if(!err){
				const userId = Meteor.userId();
				Meteor.users.update(
					{ _id: userId },
					{ $set: {
							'profile.group': groupId,
							'profile.groupAdmin': true 
						}
				});			
			};
		});
	}
});