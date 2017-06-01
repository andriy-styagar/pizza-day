import { Mongo } from 'meteor/mongo';
const Events = new Mongo.Collection('events');
const Orders = new Mongo.Collection('orders');

export { Events, Orders};
