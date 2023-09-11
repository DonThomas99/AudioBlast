const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true
    },
    maxPrice:{
        type: Number,
        required:true
    },
    discountAmount:{
        type: Number,
        required:true                      
    },
    expiryDate:{
        type:Date,
        required:true
    },
    listed:{
        type:Boolean,
        default:true,
    }
})

const Coupon = mongoose.model('coupon', couponSchema);

module.exports = Coupon;