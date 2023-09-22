const mongoose = require('mongoose');

const bannerSchema  = new mongoose.Schema({
    
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