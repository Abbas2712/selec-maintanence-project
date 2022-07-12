const fs = require('fs')
const express = require('express')
const app = express();
const morgan = require('morgan')

const technicianRouter = require('./routes/technicianRoutes');
const userRouter = require('./routes/userRoutes');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`./starter/public`))

app.use((req,res,next)=>{
    console.log("Hello from the middleware")
    next();
})

app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})

app.use('/api/v1/technician',technicianRouter);
app.use('/api/v1/users',userRouter);
    
module.exports = app;
