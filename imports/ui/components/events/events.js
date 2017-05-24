import './events.html';
import { Events } from '../../../api/events/collections.js';

Template.events.onCreated(function(){
	const instance = this;
	instance.autorun( function() {
		instance.subscribe('events');
	});
});
Template.events.helpers({
	'events'(){
		return Events.find({});
	}
});
Template.registerHelper('formattedDate', (date) => {
		return date.toString().split(' ').slice(0,5).join(' ');
});
