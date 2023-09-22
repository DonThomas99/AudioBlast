const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mob:{
    type:Number,
    required:true
  },
  password: {
    type: String,
    required: true
  },
  cart:
   [
        { 
          productId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
        discountPrice:{
          type: Number,
        },
       
      }
   ],
   
  wishlist:[
    {
   type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
    }
  ],
  orders:[
    {
      products:[

        {
          productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
          },
          quantity:{
            type: Number,
          },
          discountPrice:{
            type: Number,
          },
          totalAmount:{type: Number,
          },
          status:{
            type:String,
          
          },
          returned:{
            type:Boolean,
            default:false,

          },
          refunded:{
            type:Boolean,
            default:false,


          },
          
        },
    
      ],
      orderTotal:{
        type:Number,

      },
      Address:{
        
      },
      
      PaymentMethod:{
        type:String,
      },
     couponDiscount:{
      type:Number,
     },
      
    
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
     
    }
  ],
  addresses:[{
    userName:{
        type: String,
        required:true
    },
    mobile:{
        type: Number,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    town:{
        type: String,
        required:true
    },
    state:{
        type: String,
        required:true
    },
    country:{
        type: String,
        required:true
    },
    zip:{
        type: Number,
        required:true
    },
    address:{
        type: String,
        required:true
    }
}],

wallet:{
  balance:{
    type:Decimal128,
    default:0.0
  },transactions:[
    {
      date: {
        type: Date, // Use the Date type for date
      },
      amount: {
        type: Number, // Use the Number type for amount
      },
      type: {
        type: String, // Use the String type for type
      },
    },
  ],
},

  
  is_blocked: {
    type: Number,
    required: true
  },
  is_verified:{
    type:Boolean,
    default:false
    
  }
},
{
  timestamps:true,
}

);

const User = mongoose.model('User', userSchema);

module.exports = User;
