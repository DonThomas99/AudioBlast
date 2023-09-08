const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
productName: {
type: String,
required: true
},
brand:{
    type: String,
    required: true
},
description:{
type: String,
 required: true
},
connectivity:{
    type: String,
    required: true
},                                                                                                                                                                                                                                                                                                                                                                                                                               
category:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
},

price:{
    type: Number,
    required: true
},
discountPrice:{
type:Number,
required: true
},
stock:{
    type: Number,
    required: true,
    min: 0,
    max:50
},


image : {
    type: Array,
    maxitems:4
},
isUnlisted:{
    type: Boolean,
    default:false
},
date:{
    type: Date,
    default: Date.now
},
actualPrice:{
    type: Number,
    required: true
}

})

const Product = mongoose.model('Product', productSchema)

module.exports = Product