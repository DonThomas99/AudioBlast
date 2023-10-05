const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  is_unlisted:{
    type:Number,
    required: true,
    default: 1
  }
});
const category = mongoose.model('category', categorySchema);

module.exports = category;