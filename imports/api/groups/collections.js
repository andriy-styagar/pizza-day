import  { Mongo } from 'meteor/mongo';

const Groups = new Mongo.Collection('groups');
const Images = new FS.Collection('images',{
	 stores: [new FS.Store.FileSystem("images")],
	 filter: {
	 	allow: {
	 		contentTupes: ['image/*']
	 	}
	 }
});
Images.allow({
	insert:   function () { return true;},
 	update:   function () { return true;},
  	remove:   function () { return true;},
  	download: function () { return true;}
});
const Menu = new Mongo.Collection('menu');
export { Groups, Images, Menu};
