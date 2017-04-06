// Client entry point, imports all client code
import '/imports/startup/client';
import '/imports/startup/both';
Meteor.subscribe('users');


// E = new Mongo.Collection('e');import { Mongo } from 'meteor/mongo';
