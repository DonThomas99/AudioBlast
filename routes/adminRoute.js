const express = require('express');
const admin_route = express()
const session = require('express-session')
const config = require('../config/config')
const adminController = require('../Controllers/adminControllers')
const productController = require('../Controllers/ProductManagement')
const categoryController = require('../Controllers/CategoryManagement') 
const userController = require('../Controllers/userController2')
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.join(__dirname,'../public/Product_Images'))
    },
    filename: function(req,file,cb){
    const name = Date.now()+'-'+file.originalname
    cb(null,name)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/webp" 
        
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error("Only .png, .jpg and .jpeg .webp format allowed!"));
      }
    },
  });


admin_route.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false
}))

admin_route.set('views','./views/admin')

//for login to enter credentials
admin_route.get('/',adminController.loadLoggin)
admin_route.post('/logg',adminController.verifyLoggin)

//for dashboard 
admin_route.get('/Dashboard',adminController.loadDashboard)
//for userslist 
admin_route.get('/userslist',adminController.userslist)
//for blocking users
admin_route.get('/blockUser/:id',adminController.block)

//for viewing categorylist 
admin_route.get('/categoryList',adminController.categoryList)

//for unlisting categorylist
admin_route.get('/unlistCategory/:id',categoryController.unlistCategory)
//for adding new category
admin_route.get('/addCategory',adminController.addCategory)
admin_route.post('/addCategory',adminController.addCategoryy) 

//for editing category
admin_route.get("/editCategory",adminController.editCategory)
admin_route.post('/editCategory',adminController.updateCategory)

//for viewing products
admin_route.get('/productList',productController.productsList)

//for adding new product
admin_route.get('/addProduct',productController.addProduct)
admin_route.post('/addProduct',upload.array("image",4),productController.addProducty)

//for unlisting product
admin_route.get('/unlistProducts/:id',productController.unlistProduct)

//for editing product
admin_route.get('/editProducts',productController.editProduct)
admin_route.post('/editProducts',upload.array("image",4),productController.editProducty)
admin_route.get('/delete-image',productController.deletimage)
//for logging out
admin_route.get('/signout',adminController.signout) 

//orders admin
admin_route.get('/ordersList',adminController.ordersList)
admin_route.get('/cancelSinglePrdt/:orderId/:pdtId',userController.cancelOrder)
admin_route.get('/updateStatus/:orderId/:pdtId/:newStatus',adminController.updateStatus)
admin_route.get('/detailPage/:orderId',adminController.detailPage)

//cooupon control
admin_route.get('/couponList',adminController.couponList)
admin_route.get('/addCoupon',adminController.addCoupon)
 admin_route.post('/addCoupon',adminController.saveCoupon)
 admin_route.get('/unlistCoupon/:id',adminController.unlistCoupon)
 admin_route.get('/editCoupon',adminController.editCoupon)
 admin_route.post('/editCoupon',adminController.updateCoupon)

module.exports = admin_route;