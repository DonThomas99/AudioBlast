const express = require('express');
const session = require('express-session');
const user_route = express()
const config = require('../config/config')
const userController2 = require('../Controllers/userController2')
const auth = require('../Middleware/UserAuth')


user_route.use(session
    ({secret:config.sessionSecret,
        resave: false,
        saveUninitialized:false
}))



user_route.set('views','./views/user')

//homepage 
user_route.get('/',userController2.loadHomepage)

//forgot password
user_route.get('/forgotPassword',userController2.loadForgotPassword)
user_route.post('/forgotPassword',userController2.sendOtp)
user_route.post('/updatePassword',userController2.verifyOtp2)
user_route.post('/updatePassword2',userController2.updatePassword)

//update password

//shop
user_route.get('/shop',userController2.loadShop)
//search
user_route.post('/search',userController2.search)


//product-detail page 
user_route.get('/loadProductDetail/:id',userController2.loadProductDetail)

//register
user_route.get('/register',userController2.loadRegister)
user_route.post('/register',userController2.insertUser)

//login
user_route.get('/login',auth.isLogOut,userController2.loadLogin)
user_route.post('/login',userController2.verifyLogin)

//logout
user_route.post('/logout',userController2.logout)

//otp 
//user_route.get('/resend-otp',userController2.sendMail)
user_route.post('/verifyotp',userController2.verifyotp);

//userDashboard
user_route.get('/user-dashboard',userController2.userDashboard)
user_route.get('/user-dashboard/editProfile',userController2.editProfile)
user_route.post('/user-dashboard/editProfile',userController2.updateProfile)

//cart 
user_route.get('/cart',userController2.loadCart)
user_route.post('/addToCart/:id',userController2.addToCart)
user_route.post('/deleteFromCart/:id',userController2.deleteFromCart)
user_route.patch('/cart_qty',userController2.updateQty)



//wishlist
user_route.get('/wishlist',userController2.loadWishlist)
user_route.get('/add-wishlist',userController2.addWishlist)
user_route.get('/remove-wishlist',userController2.removeWishlist)

//checkout
user_route.get('/checkout',userController2.loadCheckout)
user_route.post('/cart/placeOrder',userController2.placeOrder)

//orders
user_route.get('/loadOrders',userController2.loadOrders)
user_route.get('/orderDetail/:orderId',userController2.orderDetails)
user_route.get('/cancelOrder/:orderId/:pdtId',userController2.cancelOrder)

//address
user_route.get('/user-dashboard/addAddress',userController2.loadAddAddress)
user_route.post('/user-dashboard/addAddress/:returnPage',userController2.addAddress)
user_route.get('/user-dashboard/editAddress/:id',userController2.editAddress)
user_route.post('/user-dashboard/editAddress/:id',userController2.updateAddress)
user_route.get('/user-dashboard/deleteAddress/:id',userController2.deleteAddress)

//Wallet 
user_route.get('/user-dashboard/walletHistory',userController2.loadWalletHistory)
user_route.post('/user-dashboard/addToWallet',userController2.addToWallet)
user_route.post('/verifyPaymentToWallet',userController2.verifyWalletpayment)


module.exports = user_route
