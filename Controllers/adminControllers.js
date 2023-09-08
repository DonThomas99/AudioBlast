const Admin = require('../Models/adminModel');
const User = require('../Models/userModel') 
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const category = require('../Models/categoryModel')


const securePassword = async(password)=>{
    try {
     const passwordHash = await bcrypt.hash(password,10)  
     return passwordHash
    } catch (error) {
      console.log(error.message)
      
    }
  }

exports.loadLoggin = async(req,res)=>{
    try {
        res.render('loggin')
    } catch (error) {
        console.log(error.message);
    }
}

exports.verifyLoggin = async (req, res) => {
    try {
      
      const email = req.body.email;
      const password = req.body.password;
  
      const adminData = await Admin.findOne({ email: email });
    
  
      if (adminData) {
        const passwordMatch = await bcrypt.compare(password, adminData.password);
        if (passwordMatch) {
            
            req.session.admin_id = adminData._id;
           res.redirect('/admin/dashboard');
        } else {
          res.render('loggin', { message: "Invalid Email and Password" });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  exports.loadDashboard = async(req,res)=>{
    try {
           const categoriesSales = await User.aggregate([
            { $unwind: "$orders" },
            { $unwind: "$orders.products" },
            { $match: { "orders.products.status": "Delivered" } },
            {
                $lookup: {
                    from: "products",
                    localField: "orders.products.prd_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    category: "$productDetails.category",
                    price: "$orders.products.price"
                }
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$price" }
                }
            }
        ]);
        const categoriesList = await category.find()

        const monthSales = await User.aggregate([
            {
                $unwind: "$orders"
            },
            {
                $unwind: "$orders.products"
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$orders.createdAt" },
                        month: { $month: "$orders.createdAt" }
                    },
                    monthlySales: { $sum: "$orders.products.totalAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    monthlySales: 1
                }
            },
            {
                $sort: {
                    year: 1,
                    month: 1
                }
            }
        ])

        const paymentTypeSales = await User.aggregate([
            {
                $unwind: "$orders"
            },
            {
                $unwind: "$orders.products"
            },
            {
                $match: {
                    "orders.products.status": "Delivered"
                }
            },
            {
                $group: {
                    _id: "$orders.payment_method",
                    paymentMethodSales: { $sum: "$orders.products.price" }
                }
            },
            {
                $project: {
                    _id: 0,
                    paymentMethod: "$_id",
                    paymentMethodSales: 1
                }
            }
        ])
        const amountOfUsers = await User.find({}).count()
        const amountOfBlockedUsers = await User.find({ is_blocked: true }).count()
        const amountOfOrders = await User.aggregate([
            { $unwind: "$orders" },
            { $unwind: "$orders.products" },
            { $count: "ordersCount" }
        ]) 


         const totalAmount = await User.aggregate([
          { $unwind: "$orders" },
          { $unwind: "$orders.products" },
          { $group:{_id:null,totalAmount:{$sum:"$orders.products.totalAmount"}} }
         ])
         console.log(totalAmount);
        // const amountOfCanceledOrders = await User.aggregate([
        //     { $unwind: "$orders" },
        //     { $unwind: "$orders.products" },
        //     { $match: { "orders.products.status": "Delivered" } },
        //     { $count: "ordersCount" }
        // ])
        console.log("payment type sales :",paymentTypeSales)
        // console.log("blocked Users",amountOfBlockedUsers);
        // console.log("Orders:",amountOfOrders)
        // console.log("no. of users:",amountOfUsers)
        console.log("monthly sales :",monthSales);
        console.log("category sales",categoriesSales);
        res.render('dashboard', {
            categoriesSales,
            categoriesList,
            monthSales,
            paymentTypeSales,
            amountOfUsers,
            amountOfOrders: amountOfOrders[0].ordersCount,
            totalAmount,
            // amountOfBlockedUsers,
            // amountOfCanceledOrders: amountOfCanceledOrders[0].ordersCount
       })
    } 








        
     catch (error) {
        console.log(error.message);
    }
  }

  exports.signout = async(req,res)=>{
    try {
     // req.session.destroy()
      res.redirect('/admin')
    } catch (error) {
      console.log(error.message);
    }
  }

  exports.userslist = async(req,res)=>{
    try {
      const userData = await User.find({})
      res.render('userslist',{users:userData})
      // var search = ''
      // if(req.query.search){
      //   search = req.query.search
      // }const userData = await User.find({}) 
    } catch (error) {
     console.log(error.message);
    }
  }

  exports.block= async(req,res)=>{
    try {
  const id = req.params.id 
  console.log(id);
  const user = await User.findById(id)
console.log("is_blocked:",user.is_blocked);
  if(user){
  user.is_blocked =!user.is_blocked
  
  await user.save()
  console.log("is_blocked:",user.is_blocked);
  }
  else{
    console.log('user not found');
  }
  
res.redirect('/admin/userslist')
} catch (error) {
  console.log(error.message);
       }
  }

  exports.categoryList = async(req,res)=>{
    try {
      const catData = await category.find({})
      res.render('categoryList',{cat:catData})
      // var search = ''
      // if(req.query.search){
      //   search = req.query.search
      // }const userData = await User.find({}) 
    } catch (error) {
     console.log(error.message);
    }
  }

  exports.unlistCategory= async(req,res)=>{
    try {
  
  const id = req.params.id 
  console.log(id);
  const categ = await category.findById(id)
console.log("is_unlisted:",categ.is_unlisted);
  if(categ){
  categ.is_unlisted =!categ.is_unlisted;
  
  await categ.save()
  console.log("is_unlisted:",categ.is_unlisted);
  }
  else{
    console.log('user not found');
  }
  
res.redirect('/admin/categoryList')
} catch (error) {
  console.log(error.message);
       }
  }

  exports.addCategory= async(req,res)=>{
    try {
          res.render('addCategory')
        } catch (error) {
          console.log(error.message);
        }
  }

  exports.addCategoryy= async(req,res)=>{
    try { 

      const nameRegex = /^[a-zA-Z ]+$/; 

      console.log("entering addition");
      //console.log(req.body.name);
      const newcategory = new category({
        name:req.body.name.toUpperCase(),
        is_unlisted : req.body.is_unlisted
       
      })
  
    const categName = req.body.name.toUpperCase();
    console.log(categName);
    const existingcateg = await category.findOne({name:categName});
    console.log(existingcateg);
    if (existingcateg) {
      res.render('addcategory', { message: "Category already registered" });
    } else if (!nameRegex.test(newcategory.name)) {
      res.render('addcategory', { message: "Invalid name format. Please enter alphabets and spaces only." });
    } else {   
      const categData = newcategory.save()
    if(categData){
      res.redirect('/admin/categoryList')
    } else {
          res.render('addcategory', { message: "Registration Failed" });
    }
    }  
  }
  catch (error) {
    console.log(error.message);
  }
  }

  exports.editCategory= async(req,res)=>{
    try{
      console.log("Edit Category");
      const id = req.query.id;
      console.log(id);
      const catData = await cat.findById(id);
      console.log(catData);
      if(catData){
        res.render('editCategory',{cat:catData})
      }
    }
    catch(error){
      console.log(error.message)
    }
  }

  exports.updateCategory= async(req,res)=>{
    try {  console.log("update");
    const id = req.body.id;
    const name = req.body.name.toUpperCase()
    console.log(id);
      const catData = await category.findByIdAndUpdate({_id:id},{$set:{name:name}})

      res.redirect('/admin/categoryList')
    } catch (error) {
      console.log(error.message);
    }
  }

  exports.ordersList = async(req,res)=>{
    try {
     
      let pageNum = 1;
  if (req.query.pageNum) {
    pageNum = parseInt(req.query.pageNum);
  }

  // Get the limit from the request query
  let limit = 10;
  if (req.query.limit) {
    limit = parseInt(req.query.limit);
  }

  // Get the total number of orders
  const totalOrderCount = await User.find({}).populate({
    path: 'orders.products.productId',
    model: 'Product',
  }).count();


  // Calculate the total number of pages
  let pageCount = Math.ceil(totalOrderCount / limit);

  //Get the orders for the current page
  const ordersData =  await User.find({},{orders:1}).populate({
    path: 'orders.products.productId',
    model: 'Product',
  })
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limit)
    .limit(limit);

    // console.log(ordersData);


let allOrders =[]
    for(let i=0;i<ordersData.length;i++){
      for(let j=0;j<ordersData[i].orders.length;j++){
           allOrders. push(ordersData[i].orders[j])
    }
    }

  // Render the orders list view
  res.render('ordersList', {
   ordersData: allOrders,
    page: 'Orders List',
    pageCount,
    pageNum,
    limit,
  });

    } catch (error) {
      console.log(error.message);
    }
  }

exports.updateStatus = async(req,res) => {

 try {
  const {orderId, pdtId} = req.params
  const newStatus = req.body.status
  console.log(orderId,pdtId,newStatus);
  
 let user = await User.findOne({"orders._id":orderId}).populate('orders.products.productId')

  const  order = user.orders.find((o) => o._id == orderId);

   
  for( const pdt of order.products)
  {
    
    if(pdt._id == pdtId)
    {

      pdt.status = newStatus

    }

  }

  await user.save();
  res.redirect(`/admin/ordersList`)


 } catch (error) {
  console.log(error.message);
  
 }

}



 