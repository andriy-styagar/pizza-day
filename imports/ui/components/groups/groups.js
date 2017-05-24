import './groups.html';
import { Groups } from '../../../api/groups/collections.js';

Template.groups.onCreated(function(){
	const instance = this;
	instance.autorun( function() {
		instance.subscribe('groups');
	});
});
Template.groups.helpers({
	'groups': function(){
		return Groups.find({});
	}
})