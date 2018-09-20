//get root folder
const schemaPath = require("path").join(__dirname, '../schema');
import { engineImport } from './engineHelper';

module.exports = (app, mongoose) => {
	engineImport(app, schemaPath, mongoose);
}
