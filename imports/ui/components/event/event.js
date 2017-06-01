import { Events } from '../../../api/events/collections.js';
import './event.html';
import './event-item.js';

Template.event.onCreated(function () {
    var instance = this;
    instance.eventId = FlowRouter.getParam('eventId');
    const event = instance.subscribe('eventItem', instance.eventId);
    instance.event = Events.find({_id: instance.eventId});
    instance.autorun(function () {
        if(event.ready()){
            instance.subscribe('menu', instance.event.fetch()[0].group);
        }
        instance.subscribe('eventParticipants', instance.eventId);
    });
});

Template.event.helpers({
    'event'(){
        return Events.find({_id: FlowRouter.getParam('eventId')}).fetch()[0];
    },
});