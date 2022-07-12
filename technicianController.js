const fs = require('fs')
const tours = JSON.parse(    
    fs.readFileSync("E:/Courses/nodejs_api/4-natours/after-section-06/dev-data/data/tours-simple.json")
    );

exports.check = (req,res,next,val) =>{
    console.log(`Tour id is ${val}`)
    if(req.params.id *1 > tours.length){
        return res.status(404).json({
            status : 'fail',
            message:'invalid id'
        });
    }
    next();
};

exports.checkBody = (req,res,next)=>{
    if(!req.body.name || !req.body.price ){
        return res.status(404).json({
            status : 'fail',
            message : "Missing name or price"
            
        });
    }
    next();
};
    exports.getAlltours = (req,res)=>{     
    console.log(req.requestTime)
    res.status(200).json({
    status:'success',
    results : tours.length ,
    requestedAt : req.requestTime,
    data:{
            tours    
        }
});
};
exports.getTours = (req,res)=>{
    console.log(req.params);
     const id = req.params.id *1 ;
    const tour = tours.find(el=> el.id === id)  
    res.status(200).json({
    status : 'success',
    
     data : {
         tour
     }
        
    });
};

exports.updateTours = (req,res)=>{
    
   res.status(200).json({
    status : 'success',
    data :{
        tour : "<Updated data here>"
    }
    });
};
exports.deleteTours = (req,res)=>{

    res.status(404).json({
  status : 'success',
  data :null
  });
};

exports.createTours = (req,res)=>{
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
  
    tours.push(newTour);
  
    fs.writeFile(
     "E:/Courses/nodejs_api/4-natours/starter/dev-data/data",
      JSON.stringify(tours),
      err => {
        res.status(201).json({
          status: 'success',
          data: {
            tour: newTour
          }
        });
      }
    );}
