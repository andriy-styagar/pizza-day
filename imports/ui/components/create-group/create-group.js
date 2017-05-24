import './create-group.html';
import { Images, Groups } from '../../../api/groups/collections.js';
import { errorHandler } from '../error-handler.js';

Template.createGroup.events({
	'click #create_group_but': function(e, t){
		e.preventDefault();
		const groupName = $('input[name=group-name]').val();
		const logo = $('input[name=group-logo]')[0].files[0];
		if(!logo){
			swal('', 'Not logo', 'error');	
		}
		else {
			Images.insert(new FS.File(logo), function (err, obj) {
				if(err){
					swal('', 'Error insert logo to database', 'error');
				}
				else{
					Meteor.call('createGroup',groupName, obj._id, function (err, id) {
						if(err)
							swal('', err.reason, 'error');	
						else
							FlowRouter.go('/groups/' + id);
						});
					}
		 		});
			}
		}
	});

