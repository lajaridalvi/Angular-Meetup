//get root folder
const routePath = require("path").join(__dirname, '../route');
import { engineImport } from './engineHelper';

module.exports = (app, mongoose) => {
	engineImport(app, routePath, null, true);
}