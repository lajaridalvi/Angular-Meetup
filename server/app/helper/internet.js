import request from 'request';
import { getClosestMatch } from './collection';

export const makeRequest = (url, callback, options = null, data = null) => {
	if (!url) {
		callback("No url provided", null);
	} else {
		resolveRequest(url, options, data)
			.then((res) => callback(null, res))
			.catch((rej) => callback(rej, null));
	}
}

export const resolveMultipleRequest = (items, apiObject, method_name, target_key, callback) => {
	const _items = items;
	items = [];
	let requests = _items.map((x, index) => {
		return new Promise((resolve, reject) => {
			apiObject[method_name]({ method: 'foods.search', search_expression: x }, (results) => {
				const message = results.message;
				if (message && message.foods) {
					const { food } = message.foods;
					if (food && food.length > 0) {
						const item = getClosestMatch(x, food, target_key);
						item && items.push(item);
					}
				}
				resolve();
			});
		});
	});
	Promise.all(requests).then(() => callback(items));
}

const resolveRequest = (url, options, data) => {
	return new Promise((resolve, reject) => {
		if (options) {
			options = Object.assign(options, {
				url: url
			});
			request(options, (error, response) => {
				if (!error && response.statusCode == 200) {
					resolve(JSON.parse(response.body));
				} else {
					reject(error);
				}
			})
		} else {
			request(url, (error, response) => {
				if (!error && response.statusCode == 200) {
					resolve(JSON.parse(response.body));
				} else {
					reject(error);
				}
			})
		}
	})
}