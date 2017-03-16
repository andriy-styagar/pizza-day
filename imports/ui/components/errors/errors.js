
import { Errors } from '../../../api/errors/collections.js';
import './errors.html';

Template.errors.helpers({
  errors: function() {
    return Errors.find();
  }
});