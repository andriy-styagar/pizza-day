import  { Mongo } from 'meteor/mongo';

Groups = new Mongo.Collection('groups');

Groups.allow({
	insert: function (id, doc) {
		return id && !Meteor.user().profile.group;
	},
	update: function (id, doc) {
		return id && Meteor.user().profile.group == doc._id;
	}
});



Images = new FS.Collection('images',{
	 stores: [new FS.Store.FileSystem("images")]
});

Images.allow({
	insert:   function () { return true;},
 	update:   function () { return true;},
  	remove:   function () { return true;},
  	download: function () { return true;}
});

export { Groups, Images};
