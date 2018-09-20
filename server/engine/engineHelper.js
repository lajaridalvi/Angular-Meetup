const path = require("path");
const fs = require("fs");
import { getFileUrl } from '../app/helper/collection.js';

//impoprt all .js files in current folder and ignores index.js and any folder
export const engineImport = (app, folder_path, mongoose, isRoute = false) => {
		fs
		.readdirSync(folder_path)
		.filter(x => !x.includes('index.js') && !x.includes('engineHelper.js'))
		.filter(x => x.includes('.js'))
		.map((file) => {
			const file_path = getFileUrl(folder_path, file);
			if (!require('fs').statSync(file_path).isDirectory()) {
				if (isRoute) {
					require(file_path)(app);
				} else {
					require(file_path)(app, mongoose);
				}
			}
		});
}
