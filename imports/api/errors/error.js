
import {Errors} from './collections.js';
export function throwError(err){
	Errors.insert({message: err});
}