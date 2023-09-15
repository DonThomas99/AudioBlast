const mongoose = require('mongoose');

const bannerSchema  = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    image :{
        type:Image,
    required: true
    },
    url:{
        type: String,
        required: true
    }
})
const banner = mongoose.model('banner',bannerSchema)
module.exports = banner