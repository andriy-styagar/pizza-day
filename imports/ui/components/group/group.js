import './group.html';
import './group-item.js';
import { Images, Groups } from '../../../api/groups/collections.js';

Template.group.onCreated(function () {
    const instance = this;
    instance.groupId = FlowRouter.getParam('groupId');
    const group = instance.subscribe('groupItem',instance.groupId);
    instance.group = Groups.find({_id: instance.groupId});
    instance.autorun( function() {
        if(group.ready()){
            instance.subscribe('logo', instance.group.fetch()[0].logo);
        }
    });
});

Template.group.helpers({
    'logoUrl'(){
        const logoId = Groups.findOne({_id: Template.instance().groupId}).logo;
        return Images.findOne({_id: logoId}).url();
    },
    'group'(){
        return Groups.findOne({_id: Template.instance().groupId});
    }
});
