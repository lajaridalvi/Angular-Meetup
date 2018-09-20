//get root folder
const enginePath = require("path").join(__dirname, '');
import { engineImport } from './engineHelper';

export const initRouteAndSchema = (app, mongoose) => {
	engineImport(app, enginePath, mongoose);
}