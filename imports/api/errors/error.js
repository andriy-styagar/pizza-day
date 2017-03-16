
import {Errors} from './collections.js';
export function throwErrorr(err){
	Errors.insert({message: err});
}