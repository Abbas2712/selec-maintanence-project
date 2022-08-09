const { User, Role } = require('../Models/users.model')
const { Asset, assetsconfig } = require('../Models/assets.model')
const { machinedata } = require('../Models/machinedata.model')
const { Location } = require('../Models/location.model')
const { Schedular } = require('../Models/schedular.model')
const { checklist, tasklist } = require('../Models/checklist.model')
const { getLength, checkReduncancy } = require('../Helper/admin.helper')

const bcrypt = require('bcrypt');

//////////////////////////////////////////////////// User Section ////////////////////////////////////////////////////

// get all users
const getUsers = async(req, res) => {
    try {
        let keys = req.query.user_id
        if (keys) {
            const user = await User.findOne({ user_id: keys }).populate('role','name').populate('asset_category').populate('skills').exec()
            if (user === null) return res.status(404).json({ msg: "No user Found" })
            return res.send(user)
        }
        let role = req.query.role
        if (role) {

            const roleid = await Role.find({name: role})
            role = roleid[0]._id.toString()
            console.log(role)
            const userrole = await User.find({ _id: role}).populate('role','name').populate('asset_category').populate('skills').exec()
            const total = userrole.length;
            if (userrole === null) return res.status(404).json({ msg: `No user with role: ${role} was found` })
            return res.status(200).send({ users: userrole, total: total })
        }
        const users = await User.find({}).populate('role','name').populate('asset_category').populate('skills').exec();
        const total = await User.count({});
        if (users.length == 0) return res.status(404).json({ msg: "No users Found" })

        return res.send({ users: users, total: total })

    } catch (err) {
        return res.status(500).json({ msg: err })
    }
}

//  add new user
const addUser = async(req, res) => {
    try {
        
        if (req.body.role) {
            req.body.role = await Role.find({name: req.body.role})
            req.body.role = req.body.role[0]
        }

        if(req.body.asset_category){
            category = req.body.asset_category
            if(category.length >= 2){
                let data = []
                for (let i in category){
                    categories = await assetsconfig.find({asset_name: req.body.asset_category[i]})
                    data.push(categories[0]) 
                }
                req.body.asset_category = data
            }
            Adata = await assetsconfig.find({asset_category: req.body.asset_category})
            req.body.asset_category = Adata[0]
        }

        if(req.body.skills){
            techskills = req.body.skills
            if(techskills.length >= 2){
                let data = []
                for (let i in techskills){
                    skills = await Asset.find({asset_name: req.body.skills[i]})
                    data.push(skills[0]) 
                }
                req.body.skills = data
            }else{
                skills = await Asset.find({asset_name: req.body.skills})
                req.body.skills = skills[0]
            }
            
        }

        const newUser = new User(req.body)
        const saltRounds = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, saltRounds) 

        const Userdata = await newUser.save();
        res.json(Userdata);
    } catch (error) {
        res.json({ message: error.message });
    }
}

// Update user
const updateUser = async(req, res) => { 
    try {
        // TODO rework on update assetlist and assetcategory
        if(req.body){
            if (req.body.role) {
                req.body.role = await Role.find({name: req.body.role})
                req.body.role = req.body.role[0]
            }

            // TODO calculate lenght of the asset data and do the change accordingly
            if(req.body.asset_category){
                let Adata 
                if(req.body.asset_category){
                    const oldcategory = await assetsconfig.find({})
                }
                else if(req.body.asset_category === "all"){
                    Adata = await assetsconfig.find({})
                    req.body.asset_category = Adata[0]
                }
                Adata = await assetsconfig.find({asset_category: req.body.asset_category})
                req.body.asset_category = Adata[0]
            }

            if(req.body.skills){
                let techskills = req.body.skills
                let skills = []
                if(techskills.length >= 2){
                    const oldUserSkill = await User.find({_id: req.params.id})
                    const oldUserSkills = oldUserSkill[0].skills

                    if(oldUserSkills.length >=2){
                        for (let i in  oldUserSkills){
                            const Sdata = await Asset.find({_id: oldUserSkills[i]})
                            skills.push(Sdata[0])
                        } 
                    }else{
                        const Sdata = await Asset.find({_id: oldUserSkills})
                        skills.push(Sdata[0])
                    }

                    // checks the largest length amongest old and new data array
                    let {length, obj} = getLength(skills, techskills)

                    // checks for redundant value and returns nonredundant values
                    let nonRedundant = checkReduncancy(length,obj,techskills)

                    if (nonRedundant !== undefined){
                        let data = []
                        for (let i in techskills){
                            skills = await Asset.find({asset_name: nonRedundant[i]})
                            data.push(skills[0]) 
                        }
                        req.body.skills = data
                    }else{
                        req.body.skills = ""
                    }
                    
                }else{
                    skills = await Asset.find({asset_name: req.body.skills})
                    req.body.skills = skills[0]
                }
                
            }

            const updateuser = await User.findByIdAndUpdate({ _id: req.params.id }, 
                { $push: {
                    "username": req.body.username,
                    "password": req.body.password,
                    "first_name": req.body.first_name,
                    "middle_name": req.body.middle_name,
                    "last_name": req.body.last_name,
                    "mobile_phone": req.body.mobile_phone,
                    "email_id": req.body.email_id,
                    "company_name": req.body.company_name,
                    "role": req.body.role,
                    "note": req.body.note,
                    "interfaces": req.body.interfaces,
                    "asset_category": req.body.asset_category,
                    "skills": req.body.skills 
                }},
                { new: true })
            console.log(updateuser)
            const up = await updateuser.save();
            return res.status(200).json(up);
    
        }
        return new Error({error: "update fields cannot be empty"})

        
    } catch (error) {
        return new Error(error.message)

    }

}

// Delete user
const deleteUser = async(req, res) => {
    try {
        // await User.deleteOne({_id:req.params.id})
        await User.findByIdAndDelete({ "_id": req.params.id }, (err, result) => {
            if (result) {
                return res.status(200).json({ "message": "user deleted successfully" })
            }
            if (err) {
                return res.status(403).json(err)
            }
            return res.status(403).json({ "message": "user not found" })
        })


    } catch (error) {
        return new Error(error)
    }
}

//////////////////////////////////////////////////// Role Section ////////////////////////////////////////////////////

// add new role
const addRole = async(req, res) => {
    const newRole = new Role(req.body)
    try {
        const Roledata = await newRole.save();
        res.json(Roledata);
    } catch (error) {
        res.json({ message: error.message });
    }
}

// get all roles
const getRoles = async(req, res) => {
    const roles = await Role.find({})
    try {
        if (roles.length == 0) return res.status(404).json({ msg: "No roles Found" })

        return res.status(200).json(roles);
    } catch (error) {
        res.json({ message: error });
    }
}

// delete role
const deleteRole = async(req, res) => {
    try {
        await Role.findByIdAndDelete({ "_id": req.params.id }, (err, result) => {
            if (result) {
                return res.status(200).json({ "message": "role deleted successfully" })
            }
            if (err) {
                return res.status(403).json(err)
            }
            return res.status(404).json({ "message": "role not found" })
        })

    } catch (error) {
        return new Error(error)
    }
}

//////////////////////////////////////////////////// Asset Section ///////////////////////////////////////////////////

// get one/all asset/s
const getAsset = async(req, res) => {
    try {

        const getassets = await Asset.find({})
        if (getassets.length == 0) return res.status(404).json({ msg: "No assets Found" })

        return res.json(getassets)
    } catch (error) {
        console.log(error)
        res.json({ message: error.message });
    }
}

// add asset
const addAsset = async(req, res) => {
    try {
        const newAasset = new Asset(req.body)
        const assetData = await newAasset.save();
        res.status(201).json(assetData);

    } catch (error) {
        res.json({ message: error.message });
    }
}

// delete asset
const deleteAsset = async(req, res) => {
    try {
        await Asset.findByIdAndDelete({ "_id": req.params.id }, (err, result) => {
            if (result) {
                return res.status(200).json({ "message": "asset deleted successfully" })
            }
            if (err) {
                return res.status(403).json(err)
            }
            return res.status(404).json({ "message": "asset not found" })
        })
    } catch (error) {
        return new Error(error)
    }
}

//////////////////////////////////////////////////// Asset Category Section //////////////////////////////////////////

// add asset category
const addAssetCategory = async(req, res) => {
    try {
        let udata = []

        if(req.body.asset_list){
            for (let i=0; i<req.body.asset_list.length;i++){
                const updateasset = await Asset.find({ asset_name: req.body.asset_list[i] })
                udata.push(updateasset[0]) 
            }
            req.body.asset_list = udata
        }

        const addassetcategory = new assetsconfig(req.body)
        const assetcategorydata = await addassetcategory.save()
        res.status(201).json(assetcategorydata)
    } catch (error) {
        res.json({ message: error.message });
    }
}

// get asset category
const getAssetCategory = async(req, res) => {
    try {
        const keys = req.query.asset_id
        if (keys) {
            const assetdata = await assetsconfig.findOne({ asset_id: keys })
            if (assetdata === null) return res.status(404).json({ msg: "No category Found" })
            return res.send(assetdata)
        }
        const getassetcategory = await assetsconfig.find({}).populate('asset_list')
        if (getassetcategory.length == 0) return res.status(404).json({ msg: "assetcategory not found" })

        res.status(200).json(getassetcategory)
    } catch (error) {
        return new Error(error)
    }
}

// update asset category
const updateAssetCategory = async(req, res) => {
    try {
        if (req.body) {
            let udata = []
            let list = []
            let newdata = req.body.asset_list
            let nonsimilardata=[] 
            similardata = []
            let length = 0

            // Old asset Category data
            const oldAssetCategoryData = await assetsconfig.find({_id: req.params.id})
            const oldAssetData = oldAssetCategoryData[0].asset_list

            // checking similar asset data in asset_list to avoid redundency //
            // TODO replace code with helper

            // filtering old asset_list name into a new list
            for(let i=0; i<oldAssetData.length; i++){
                list[i] = oldAssetData[i].asset_name
            }
            obj1 = Object.values(list)

            // comparing and assigning the largest list length to lenght variable
            if (newdata.length >= oldAssetData.length){
                length = newdata.length
            }else{
                length = oldAssetData.length
            }

            // checking redendancy in the data
            for (let i=0; i<length;i++){
                if(obj1.includes(newdata[i]) == false){
                    nonsimilardata.push(newdata[i])
                }else{
                    similardata.push(newdata[i])
                }
            }

            if(nonsimilardata !== undefined){
                if (nonsimilardata.length > 1) {
                    for (let i in nonsimilardata) {
                        const updateasset = await Asset.find({ asset_name: nonsimilardata[i] })
                        udata.push(updateasset[0]) 
                    }
                    req.body.asset_list = udata
                } else {
                    const updateasset = await Asset.find({ asset_name: nonsimilardata })
                    req.body.asset_list = updateasset[0]
                }

                const updateassetcategory = await assetsconfig.findOneAndUpdate({ _id: req.params.id }, 
                    { $push: {
                        "asset_category": req.body.asset_category,
                        "asset_list": req.body.asset_list
                    } }, 
                    { new: true })
                console.log(updateassetcategory)
                const uac = await updateassetcategory.save();
                return res.status(200).json(uac)
            }
            return res.status(422).json({msg:"asset list already exits"})
        } 
        return res.status(400).json({msg:"request body cannot be empty"})
        
    } catch (error) {
        return new Error(error)
    }
}

// delete asset category
const deleteAssetCategory = async(req, res) => {
    try {
        await assetsconfig.findByIdAndDelete({ '_id': req.params.id }, (err, result) => {
            if (result) {
                return res.status(200).json({ msg: "asset category deleted successfully" })
            }
            if (err) {
                return res.status(403).json(err)
            }
            return res.status(404).json(" asset category not found")
        })
    } catch (error) {
        return new Error(error)
    }
}

///////////////////////////////////////////////////// Machinary Section ////////////////////////////////////////////////

// add machine
const addMachine = async(req, res) => {
    try {
        const newmachine = new machinedata(req.body)
        const Nmachinedata = await newmachine.save()
        res.status(201).json(Nmachinedata)
    } catch (error) {
        return new Error(error)
    }
}

// get machine
const getMachine = async(req, res) => {
    try {
        const mdata = await machinedata.find({})
        const totalcount = await machinedata.count({})
        if (mdata.length === 0) return res.status(404).json({ message: "No machines found" })

        return res.status(200).json({ machines: mdata, total: totalcount })
    } catch (error) {
        return new Error(error)
    }
}

// delete machine
const deleteMachine = async(req, res) => {
    try {
        await machinedata.findByIdAndDelete({ _id: req.params.id }, (err, result) => {
            if (result) {
                return res.status(200).json({ message: "machine deleted successfully" })
            }
            if (err) {
                return new Error(err)
            }
            res.status(404).json({ message: "machine not found" })
        })
    } catch (error) {
        return new Error(error)
    }
}

// update machine
const updateMachine = async(req, res) => {
    try {
        if (req.params.id) {
            const machineupdate = await machinedata.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
            const Mdata = await machineupdate.save()
            res.status(200).json({ data: Mdata })
        }
        res.json({ message: "machineid is required" })
    } catch (error) {
        return new Error(error)
    }
}

//////////////////////////////////////////////////// Schedular Section ///////////////////////////////////////////////

// get schedular
const getSchedular = async(req, res) => {
    try {
        if(req.query.asset_category){
            const schedular = await Schedular.find({ asset_category: req.query.asset_category });
            const total = schedular.length;
    
            if (total == 0) return res.status(404).json({ msg: "no schedules found" })
    
            res.status(200).json({ Schedules: schedular, total: total })
        }

        const schedular = await Schedular.find({});
        const total = schedular.length;

        if (total == 0) return res.status(404).json({ msg: "no schedules found" })

        res.status(200).json({ Schedules: schedular, total: total })
    } catch (error) {
        return new Error(error)
    }
}

// get a schedule
const getOneSchedule = async(req,res)=>{
    try {
        if(req.params.id){
            const schedular = await Schedular.find({_id: req.params.id});
            const total = schedular.length;
    
            if (total == 0) return res.status(404).json({ msg: "no schedule found" })
    
            res.status(200).json({ Schedule: schedular })
        }
        return res.status(400).json({msg: "id cannot be empty"})
    } catch (error) {
        return new Error(error)
    }
}

// add schedular
const addSchedular = async(req, res) => {
    try {
        const newSchedule = new Schedular(req.body)
        const schedulardata = await newSchedule.save()
        res.status(200).json({ msg: "data saved successfully" })
    } catch (error) {
        return new Error(error)
    }
}

// update schedular
const updateSchedular = async(req, res) => {
    TODO // add update schedular logic here
}

// delete schedular

const deleteSchedular = async(req, res) => {
    try {
        await Schedular.findByIdAndDelete({ _id: req.params.id }, (err, result) => {
            if (err) return new Error(err)
            if (result) return res.status(200).json({ msg: "schedular deleted successfully" })
        })
        return res.status(404).json({ msg: "schedular not found" })
    } catch (error) {
        return new Error(error)
    }
}

//////////////////////////////////////////////////// Location Section ///////////////////////////////////////////////

// add location
const addLocation = async(req, res) => {
    try {
        const newLocation = new Location(req.body)
        const locationdata = await newLocation.save()
        res.status(201).json({ "new Location": locationdata })
    } catch (error) {
        return new Error(error)
    }
}

// get location
const getLocation = async(req, res) => {
    try {
        if (req.query) {
            let status = req.query.status
            let city = req.query.city
            console.log(status, city)

            if (status && city) {
                const getlocationbystatusandcity = await Location.find({ status: { $regex: status }, city: { $regex: city } })
                const gettotalcount = getlocationbystatusandcity.length
                return res.status(200).json({ locations: getlocationbystatusandcity, total: gettotalcount }).end()
            }
            if (status) {
                const getlocationbystatus = await Location.find({ status: { $regex: status } })
                const totalstatuscount = getlocationbystatus.length
                return res.status(200).json({ status: getlocationbystatus, total: totalstatuscount }).end()
            }
            if (city) {
                const getlocationbycity = await Location.find({ city: { $regex: city } })
                const totalcitycount = getlocationbycity.length
                return res.status(200).json({ cities: getlocationbycity, total: totalcitycount }).end()
            }
        }

        const getlocations = await Location.find({})
        const totalcount = await Location.count({})
        if (totalcount === 0) return res.status(404).json({ message: "no locations found" })
        res.status(200).json({ locations: getlocations, total: totalcount })
    } catch (error) {

    }
}

// update location
const updateLocation = async(req, res) => {
    try {
        if (req.params.id) {
            const updatelocation = await Location.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
            console.log(updatelocation)
            const updatedata = await updatelocation.save()
            res.status(200).json({ data: updatedata })
        }
        res.json({ message: "userid is required" })


    } catch (error) {
        return new Error(error)
    }
}

// delete location
const deleteLocation = async(req, res) => {
    try {
        await Location.findByIdAndDelete({ _id: req.params.id }, (err, result) => {
            if (result) {
                return res.status(200).json({ message: "location deleted successfully" })
            }
            if (err) {
                return new Error(err)
            }
            res.status(404).json({ message: "location not found" })
        })
    } catch (error) {
        return new Error(error)
    }
}

//////////////////////////////////////////////////// Checklist Section ///////////////////////////////////////////////

// get checklists
const getChecklist = async(req,res) => {
    try {

        if(req.query.machine_name){
            const getchecklist = await checklist.find({machine_name: req.query.machine_name})
            const total = getchecklist.length

            if(total == 0) return res.status(404).json({msg: "no checklist found"})

            return res.status(200).json({checklist: getchecklist, total: total})
        }
        const getchecklist = await checklist.find({})
        const total = getchecklist.length

        if(total == 0) return res.status(404).json({msg: "no checklist found"})

        return res.status(200).json({checklist: getchecklist, total: total})

    } catch (error) {
        return new Error(error)
    }
}

// get one checklist
const getOneChecklist = async(req,res) => {
    try {
        if(req.params.id){
            const getonechecklist = await checklist.find({_id: req.params.id})
            const total = getonechecklist.length
            if(total == 0) return res.status(404).json({msg: "no checklist found"})
    
            return res.status(200).json({checklist: getonechecklist}) 
        }
        return res.status(400).json({msg:"id cannot be empty"})
    } catch (error) {
        return new Error(error)
    }
}

// add checklist
const addChecklist = async(req,res) => {
    // TODO add checklist logic and with dynamic tasklist addition
    try {

        // if tasklist exists in req body, create new tasklist
        // check if tasklist already exists?
        if(req.body.checklist){
            const tasklistdata = req.body.checklist
            console.log(tasklistdata.length)
            for (let i in tasklistdata){
                const newtasklist = new tasklist({task: tasklistdata[i]})
                const savetasklist = await newtasklist.save()
            }
        }

        // get id of newly created tasklist and push it to req.body.checklist array/list

        const newchecklist = new checklist()
    } catch (error) {
        return new Error(error)
    }
}
module.exports = { getUsers, addUser, updateUser, deleteUser, addRole, getRoles, deleteRole, getAsset, addAsset, deleteAsset, addAssetCategory, getAssetCategory, deleteAssetCategory, updateAssetCategory, addMachine, getMachine, deleteMachine, updateMachine, getSchedular, getOneSchedule, addSchedular, updateSchedular, deleteSchedular, addLocation, getLocation, updateLocation, deleteLocation, getChecklist, getOneChecklist, addChecklist}