const upload = require('../Middleware/imageUpload.middleware')
const { imageModel } = require('../Models/checklist.model')
const {User , Role } = require('./../Models/users.model')
const { findUser } = require('../Middleware/checkAuth.middleware')
const { Router } = require('express')
const {Ticket} = require('../Models/ticket.models')
// const imageUpload = async(req, res) => {
//     upload(req, res, (err) => {
//         if (err) console.log(err)

//         const newImage = new imageModel({
//             name: req.body.name,
//             image: {
//                 data: req.file.filename,
//                 contentType: ['image/png', 'image/jpg', 'image/jpeg']
//             }
//         })
//         try {
//             await newImage.save()

//         } catch (err) {
//             res.json({ message: error });
//         }
//     })
// }

const workOrder =async (req,res)=>{
    try{

       
        //checking if the role is technician
        const username = req.valid.username  // data retrived from token
        const user = await findUser(username)
        console.log(user)                    
        const userid = user._id
        
        const roles = await Role.find({
            _id : user.role
        })
        
        console.log(roles[0].name)
        //skills of the technician
        
        console.log(user.skills)
         skill = await assetData.find({
             skill : user.skills
         })
        
         //checking if the ticket assetname is there in the array of skills 
        
        const ticketassetname  = await Ticket.find({
            asset_name : assetData  
        })
        console.log(ticketassetname[0]);

        if(skill.includes(ticketassetname))
        {
            console.log("Skills are present")
        }
        else
        {
            console.log("Skills are there")
        }
    }
    catch(error){
return res.status(500).json({msg : error})
    }
}
module.exports = { workOrder}
