import { Events } from './collections.js';
Meteor.publish('events',function (groupId) {
	return Events.find({group: groupId});
});