module.exports.addCompIndustry = (req,res)=>{
    console.log('req.body :', req.body);   

    const companyIndArray = req.body
    console.log('companyIndArray :', companyIndArray);

    companyIndArray.map(c=>{
        req.app.db.models.companyIndustries.create(c, (err,data)=>{
            console.log('Added :' + data);
        })
    })
} 