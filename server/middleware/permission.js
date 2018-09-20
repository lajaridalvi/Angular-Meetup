/*@Param: permissions contains array of permissions like ['view', 'edit', 'delete']*/
export const checkPermission = (permissions) => {

	return (req, res, next) => {
		// console.log('inside permissions: ', req.JWTData);
		if (Array.isArray(permissions)) {
			if (req.JWTData && req.JWTData.permissions) {
				let errors = [];
				const userPermissions = req.JWTData.permissions;
				// console.log(permissions);
				// console.log("permissions ....", permissionContains(['1' ,'2' ,'3'] , ['1' , '2']));
				// console.log("permissions ....", permissionContains(userPermissions , permissions));
				if (permissionContains( userPermissions, permissions)) {
					console.log('1')
					next()
					return
				}
				else {
					console.log('2')
					
					res.json({
						status: '403',
						message: "You don't have necessary permission"
					})
					return
				}
				// if (errors.length > 0) {
				// 	return next(errors);
				// } else {
				// 	return next();
				// }
			} else {
        	res.json({
						status: '403',
						message: "You don't have necessary permission"
					})
					return
			}
		} else {
			return next('Array is expected as input to middleware but found: ' + typeof permissions);
		}
	}
};


function permissionContains(arr1, arr2) {
	var o = {}
	var result = true;

	// Count all the objects in container
	for (var i = 0; i < arr1.length; i++) {
		if (!o[arr1[i]]) {
			o[arr1[i]] = 0;
		}
		o[arr1[i]]++;
	}

	// Subtract all the objects in containee
	// And exit early if possible
	for (var i = 0; i < arr2.length; i++) {
		if (!o[arr2[i]]) {
			o[arr2[i]] = 0;
		}
		if (--o[arr2[i]] < 0) {
			result = false;
			break;
		}
	}
	return result;
}

export const PERMISSION_ADD = "add";
export const PERMISSION_VIEW = "view";
export const PERMISSION_EDIT = "edit";
export const PERMISSION_DELETE = "delete";