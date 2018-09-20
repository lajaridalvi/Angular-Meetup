import { checkPermission } from '../middleware/permission'

module.exports = (app) => {
    app.post('/addCompIndustry', require(__base + '/app/controllers/companyInd.js').addCompIndustry);
} 