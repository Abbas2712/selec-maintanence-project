const mongoose = require('mongoose')
const Schema = mongoose.Schema

const workOrder = new Schema({
    orderId: {
        type: Number,
        require: true
    },
    orderName: {
        type: String,
        require: true
    }
})