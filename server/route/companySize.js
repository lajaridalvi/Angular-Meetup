import { checkPermission } from '../middleware/permission'

module.exports = (app) => {
    app.post('/addCompSize', require(__base + '/app/controllers/companySize.js').addCompSize);
} 