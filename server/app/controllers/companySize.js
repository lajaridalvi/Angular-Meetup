module.exports.addCompSize = (req,res)=>{
    console.log('req.body :', req.body);   
    const companySizeArray = req.body
    console.log('companySizeArray :', companySizeArray);
    let array = []
    companySizeArray.map(c=>{
        req.app.db.models.companySize.create(c, (err,data)=>{
            console.log('Added :' + data);
            array.push(data)
        })
    })
    res.json(array)
} 