//import { swal } from 'meteor/kevohagan:sweetalert';
function errorHandler (err){
	if(err){
		swal('', err.reason, "error");
	}
};
export { errorHandler };