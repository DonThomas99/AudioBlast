const User = require("../Models/userModel");
const product = require("../Models/productModel");
const category = require("../Models/categoryModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const coupon = require("../Models/couponModel");
const banner = require("../Models/bannerModel")
const { request } = require("http");
var easyinvoice = require("easyinvoice")
 
require("dotenv").config();

var instance = new Razorpay({
  key_id: process.env.YOUR_KEY_ID,
  key_secret: process.env.YOUR_KEY_SECRET,
});

let otp;

const getOTP = () => Math.floor(Math.random() * 900000) + 100000;

const verif_code = getOTP();

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const sendMail = (email, verif_code) => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "donthomas20399@gmail.com",
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: "donthomas20399@gmail.com",
    to: email,
    subject: "AudioBlast OTP ",
    text: `your verification code is :${verif_code} Do not share the otp`,
  };

  mailTransporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log("Error occured");
      console.log(err);
    } else {
      console.log("code is sent");
    }
  });
};

exports.insertUser = async (req, res) => {
  try {
    let mob = "+91",
      name,
      email,
      password;
    mob += req.body.mob;
    name = req.body.name;
    email = req.body.email;
    password = req.body.password;
    req.session.email = email;
    const spassword = await securePassword(password);
    const userExists = await User.findOne({ email }).select("email");
    if (userExists) {
      return res.render("registration", { message: "email already exists" });
    }
    const user = new User({
      name,
      email,
      mob,
      is_blocked: 0,
      password: spassword,
      is_verified: 0,
    });
    const userData = await user.save();
    if (userData) {
      otp = verif_code;
      sendMail(req.body.email, verif_code);
      //     const email = req.body.email
      //     const encodedEmail = encodeURIComponent(email)
      //     const otpVerifyUrl = `http://localhost:3001/otp-verify?id=${encodedEmail}`
      //     res.redirect(otpVerifyUrl)
      res.render("otp");
    } else {
      res.render("registration", { message: "failed" });
    }
  } catch (error) {}
};

exports.verifyotp = async (req, res, next) => {
  try {
    const enteredOtp = req.body.otp;
    const email = req.session.email;
    if (enteredOtp == otp) {
      const userfound = await User.findOneAndUpdate(
        { email: email },
        { $set: { is_verified: true } }
      );
      res.render("login");
    } else {
      res.render("otp", { message: "Incorrect OTP" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("otp", { message: "Error occurred during OTP verification" });
  }
};

exports.loadRegister = (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadHomepage = async (req, res) => {
  try {
    const session = req.session.user_id;
    const user = await User.findOne({ _id: session });
    const banners = await banner.find({})
    let categorylist = await category.find({is_unlisted:1});
    res.render("homepage", { user: user,categorylist: categorylist,banners: banners });
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};
exports.verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (userData.is_blocked === 0) {
        if (passwordMatch) {
          req.session.user_id = userData._id;
          res.redirect("/");
        } else {
          res.render("login", { message: "Invalid password" });
        }
      } else {
        res.render("login", {
          message:
            "You have been blocked, Please contact the administrator !!!",
        });
      }
    } else {
      res.render("login", { message: "Invalid email and password" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//module.exports ={sendMail}

exports.loadShop = async (req, res) => {
  try {
    const session = req.session.user_id;
    const user = await User.findOne({ _id: session });
    let selectedCat = "";
    let categoryName ="";
    const catego = req.query.category;
    const search = req.query.search;
    const min = req.query.min;
    const max = req.query.max;
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 3;

    let categorylist = await category.find({});

    // Build the base query for products
    let query = product.find({ isUnlisted: false }).populate("category");

    if (catego) {
      query = query.where("category").equals(catego);
      selectedCat = catego;

       categoryName = await category.findOne({ _id: catego });

    }
    if (search) {
      // const category = req.body.val
      const regexPattern = new RegExp(search, "i");
      query = query.where("productName").regex(regexPattern);
    }
    if (min || max) {
      query = query
        .where("discountPrice")
        .gt(min || 0)
        .lt(max || Infinity);
    }

    // Count total documents for pagination
    const countQuery = query.clone(); // Create a clone of the query
    const count = await countQuery.countDocuments();

    // Apply sorting, limit, and skip for pagination
    let pdt = await query
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    if (pdt) {
      res.render("shop", {
        user,
        selectedCat,
        search,
        categoryName,
        pdts: pdt,
        category: categorylist,
        totalPages: Math.ceil(count / limit),

        currentPage: page,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadProductDetail = async (req, res) => {
  try {
    const session = req.session.user_id;
    const user = await User.findOne({ _id: session });
    const userid = req.session.user_id;
    const pdtId = req.params.id;
    if (userid) {
      const user2 = await User.findOne({ _id: userid }, { wishlist: 1 });
      const isExist = user2.wishlist.find((prd) => prd == pdtId);
      const pdt = await product.findById(req.params.id).populate("category");
      if (pdt) {
        res.render("productDetail", { user, pdt: pdt, isExist });
      }
    } else {
      //const isExist = user.wishlist.find(prd =>prd == pdtId)
      const pdt = await product.findById(req.params.id).populate("category");
      const categName = pdt.category._id.toString()
      const products = await product
  .find({ _id: { $ne:pdtId},category: categName })
  .limit(4);

      if (pdt) {
        res.render("productDetail", { user, pdt: pdt, isExist: null,products: products});
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadForgotPassword = async (req, res) => {
  try {
    const message = req.body.message;
    res.render("forgotPassword", { message });
  } catch (error) {
    log.error(error.message);
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email });
    if (userData) {
      otp = verif_code;
      sendMail(req.body.email, verif_code);
      res.render("otp2", { email });
    } else {
      const message = "failed";
      res.redirect("/forgotPassword?message=", { message });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.verifyOtp2 = async (req, res, next) => {
  try {
    const enteredOtp = req.body.otp;
    const email = req.body.email;

    if (enteredOtp == otp) {
      res.render("updatePassword", { email });
    } else {
      res.render("otp", { message: "Incorrect OTP" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("otp", { message: "Error occurred during OTP verification" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.body.email;
    const spassword = await securePassword(password);
    if (password === confirmPassword) {
      await User.updateOne({ email: email }, { $set: { password: spassword } });
      res.redirect("/login");
    } else {
      res.render("updatePassword", { message: "passwords do not match" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadCart = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId).populate("cart.productId");
    // console.log(userData);
    const cartItems = userData.cart;

    res.render("cart", { cartItems });
    // Assuming you're rendering a view named 'cart'
  } catch (error) {
    console.log(error.message);
  }
};

exports.addToCart = async (req, res) => {
  try {
    const pdtId = req.params.id;
    const userId = req.session.user_id;
    const userData = await User.findById({ _id: userId });
    const pdt = await product.findById({ _id: pdtId });

    const cartItem = {
      productId: pdtId,
      price: pdt.price,
      discountPrice: pdt.discountPrice,
      quantity: 1,
    };
    const isExist = await User.findOne({
      _id: userId,
      cart: { $elemMatch: { productId: pdtId } },
    });
    if (!isExist) {
      const userData2 = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            cart: cartItem,
          },
        }
      );
    }
    res.redirect("/cart");

    // }
  } catch (error) {
    console.log(error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

exports.deleteFromCart = async (req, res) => {
  try {
    const pdtId = req.params.id;
    const userId = req.session.user_id;

    const userData = await User.updateOne(
      { _id: userId },
      {
        $pull: { cart: { productId: pdtId } },
      }
    );

    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const pdt = await User.findOne({ _id: userId }, { wishlist: 1 }).populate(
      "wishlist"
    );
    // console.log(pdt);
    if (pdt) {
      res.render("wishlist", { pdts: pdt });
    } else {
      res.render("wishlist", { message: "wishlist is empty" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.updateQty = async (req, res) => {
  const user = req.session.user_id;
  const pdtId = req.body.productId;
  const action = req.body.action;
  // console.log(user);

  try {
    //    let totalAmount=0
    //    for( let i = 0; i < cartItems.length; i++ ) {
    //    totalAmount+= cartItems[i].quantity*cartItems[i].discountPrice
    //    console.log(cartItems[i].discountPrice)

    //    }
    //  console.log(totalAmount)

    if (action == "increase") {
      const updateDocument = await User.updateOne(
        {
          _id: user,
          "cart.productId": pdtId,
        },
        { $inc: { "cart.$.quantity": 1 } }
      );
    } else if (action == "decrease") {
      const updateDocument = await User.updateOne(
        {
          _id: user,
          "cart.productId": pdtId,
        },
        { $inc: { "cart.$.quantity": -1 } }
      );
    }
    let quantity = await User.findOne(
      {
        _id: user,
        "cart.productId": pdtId,
      },
      { cart: 1 }
    );

    const qty = quantity.cart.find((pdt) => pdt.productId == pdtId);
    // console.log("1",qty);
    res.status(200).json({ quantity: qty });
  } catch (error) {
    console.log(error.message);
  }
};

exports.search = async (req, res) => {
  try {
    const category = req.body.category;
    const search = req.body.search;
    res.redirect(`/shop?search=${search}&category=${category}`);
  } catch (error) {
    console.log(error.message);
  }
};
exports.addWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const pdtId = req.query.id;
    await User.updateOne({ _id: userId }, { $push: { wishlist: pdtId } });
    res.redirect(`/loadProductDetail/${pdtId}`);
  } catch (error) {
    console.log(error.message);
  }
};
exports.removeWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const pdtId = req.query.id;
    await User.updateOne({ _id: userId }, { $pull: { wishlist: pdtId } });
    res.redirect(`/loadProductDetail/${pdtId}`);
  } catch (error) {
    console.log(error.message);
  }
};
exports.userDashboard = async (req, res) => {
  try {
    const session = req.session.user_id;
    const user = await User.findOne({ _id: session });

    const walletHistory = user.wallet.transactions.reverse();

    res.render("userDashboard", { user, walletHistory });
  } catch (error) {
    console.log(error.message);
  }
};
exports.editProfile = async (req, res) => {
  try {
    const session = req.session.user_id;
    const user = await User.findOne({ _id: session });

    res.render("editProfile", { user });
  } catch (error) {
    console.log(error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user_id;
    console.log(req.body);
    const { name, mob } = req.body;
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          name,
          mob,
        },
      }
    );
    res.redirect("/user-dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadCheckout = async (req, res) => {
  try {
    const session = req.session.user_id;
    const user = await User.findOne({ _id: session });
    const coupons = await coupon.find({ listed: true });

    const userData = await User.findById(session).populate("cart.productId");
    // console.log(userData);
    const cartItems = userData.cart;
    if( req.session.couponDiscountedAmt ||req.session.CouponUsed || req.session.payAmount || req.session.walletBal  ){
      
      delete req.session.couponDiscountedAmt
      delete req.session.CouponUsed
      delete req.session.payAmount
      delete req.session.walletBal
    }

    res.render("checkout", { user, cartItems, coupons });
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadAddAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    const user = await User.findOne({ _id: session });

    const returnPage = req.query.returnPage;
    res.render("addAddress", {
      page: "Add Address",
      parentPage: "user-dashboard",
      returnPage,
      user,
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.addAddress = async (req, res) => {
  try {
    console.log("Add Address");
    const userId = req.session.user_id;
    const { name, email, mobile, town, state, country, zip, address } =
      req.body;
    console.log(req.body);
    const returnPage = req.params.returnPage;

    const newAddress = {
      userName: name,
      email,
      mobile,
      town,
      state,
      country,
      zip,
      address,
    };

    const user = await User.findOne({ _id: userId });

    if (user) {
      user.addresses.push(newAddress);

      // Save the updated user document
      await user.save();

      switch (returnPage) {
        case "user-dashboard":
          res.redirect("/user-dashboard");
          break;
        case "checkout":
          res.redirect("/checkout");
          break;
      }
    }
  } catch (error) {
    console.log(error.messge);
  }
};

exports.ordersuccess = async (req, res) => {
  try {
  } catch (error) {
    console.log(error.message);
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.body.address; // Assuming you're getting the selected address ID from the form
    const paymentMethod = req.body.payment; // Assuming you're getting the selected payment method from the form
    const isWalletSelected = req.body.isWalletCheckbox;
    const user = await User.findById(userId);


    // Get the selected address from the user's addresses array

    if (paymentMethod == "COD" || paymentMethod == "Wallet") {
      const selectedAddress = user.addresses.find(
        (address) => address._id.toString() === addressId
      );

      let couponDiscount
      // Calculate the order total and create the order object

      let orderTotal = 0;
      const cartItems = user.cart;
      console.log(cartItems);
      if(req.session.couponAmount)
        {
          couponDiscount = parseInt(req.session.couponAmount)
        }
      const orderProducts =  cartItems.map( (item) => {
        if (req.session.payAmount) {
          orderTotal += req.session.payAmount;
        } else {
          orderTotal += item.quantity * item.discountPrice;
        }
        if(req.session.walletEmpty){
          user.wallet.balance = 0
          user.save();
        }
        let walletBalance = parseInt(user.wallet.balance);
        if (paymentMethod == "Wallet") {
          walletBalance -= orderTotal;
          user.wallet.balance = walletBalance;

          user.save();
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          discountPrice: item.discountPrice,
          totalAmount: item.quantity * item.discountPrice,
          status: "Order Confirmed", // Assuming the initial status is Order Confirmed
          returned: false,
          refunded: false,
        };
      });
      
      const updateStock = cartItems.map( async(item) =>{
        
        const result= await product.updateOne(
            { _id: item.productId },
            { $inc: { stock: -item.quantity } }
          );
      })

      const order = {
        products: orderProducts,
        orderTotal: orderTotal,
        Address: selectedAddress,
        PaymentMethod: paymentMethod,
        couponDiscount:couponDiscount
      };

      // Add the order to the user's orders array and update the cart
      await User.findByIdAndUpdate(userId, {
        $push: { orders: order },
        $set: { cart: [] }, // Clear the cart after placing the order
      });

      if (paymentMethod == "COD") {
        res.json({ status: "COD" });
      } else {
        res.json({ status: "Wallet" });
      }
    } else if (paymentMethod == "Razorpay") {
      req.session.rpbody = req.body;
      if(req.session.payAmount){
        payAmount = req.session.payAmount;

      }else{
       payAmount = req.body.payAmount;
      }
      // copied

      const id = crypto.randomBytes(8).toString("hex");
      var options = {
        amount: payAmount * 100,
        currency: "INR",
        receipt: "hello" + id,
      };
      instance.orders.create(options, (err, order) => {
        if (err) {
          console.log(err);
          res.json({ status: false });
        } else {
          res.json({ status: "Razorpay", order: order });
        }
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("An error occurred while placing the order.");
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.session.rpbody.address;
    const details = req.body;
    const user = await User.findById(userId);
    // Accessing properties without square brackets and quotes
    console.log(details.response.razorpay_order_id);
    console.log(details.order.amount);

    const amount = parseInt(details.order.amount) / 100;
    console.log(amount);

    let hmac = crypto.createHmac("sha256", process.env.YOUR_KEY_SECRET);
    hmac.update(
      details.response.razorpay_order_id +
        "|" +
        details.response.razorpay_payment_id
    );
    hmac = hmac.digest("hex");

    if (hmac === details.response.razorpay_signature) {
      console.log("payment verified updating transactions");

      const selectedAddress = user.addresses.find(
        (address) => address._id.toString() === addressId
      );

      // Calculate the order total and create the order object

      let orderTotal = 0;
      
      const cartItems = user.cart;
      const orderProducts = cartItems.map((item) => {
        if (req.session.payAmount) {
          orderTotal += req.session.payAmount;
        } else {
          orderTotal += item.quantity * item.discountPrice;
        }
        console.log("orderTotal:", orderTotal);
        let walletBalance = parseInt(user.wallet.balance);
        console.log("wallet Balance:", user.wallet.balance);

        return {
          productId: item.productId,
          quantity: item.quantity,
          discountPrice: item.discountPrice,
          totalAmount: item.quantity * item.discountPrice,
          status: "Order Confirmed", // Assuming the initial status is Order Confirmed
          returned: false,
          refunded: false,
        };
      });

      const order = {
        products: orderProducts,
        orderTotal: orderTotal,
        Address: selectedAddress,
        PaymentMethod: "Razorpay",
      };

      // Add the order to the user's orders array and update the cart
      await User.findByIdAndUpdate(userId, {
        $push: { orders: order },
        $set: { cart: [] }, // Clear the cart after placing the order
      });

      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadOrders = async (req, res) => {
  try {
    const userId = req.session.user_id;

    // Fetch the user data including orders and populate products
    const user = await User.findById(userId).populate({
      path: "orders.products.productId",
      model: "Product",
    });

    const orderData = user.orders; // Array of orders
    console.log(orderData);

    res.render("myOrders", {
      user: user,
      orderData: orderData,
      page: "My Orders",
      parentPage: "user-dashboard",
    }); // Render EJS template with data
  } catch (error) {
    console.error(error.message);
    res.status(500).send("An error occurred while fetching order history.");
  }
};

exports.orderDetails = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const orderId = req.params.orderId;

    const user = await User.findById(userId).populate(
      "orders.products.productId"
    );

    const order = user.orders.find((o) => o._id.toString() === orderId);

    //console.log(order);
    if (!order) {
      return res.status(404).send("order not found");
    }

    let status;

    switch (order.orderStatus) {
      case "Order Confirmed":
        status = 1;
        break;
      case "Shipped":
        status = 2;
        break;
      case "Out For Delivery":
        status = 3;
        break;
      case "Delivered":
        status = 4;
        break;
      case "Cancelled":
        status = 5;
        break;
      case "Cancelled By Admin":
        status = 6;
        break;
      case "Pending Return Approval":
        status = 7;
        break;
      case "Returned":
        status = 8;
        break;
    }

    res.render("orderDetails", {
      user,
      page: "Order Details",
      parentPage: "My Orders",
      orderData: order,
      status,
    });
  } catch (error) {
    console.log(error.message);
  }
};
exports.cancelOrder = async (req, res) => {
  try {
    // console.log("Cancelling order");
    let userId = req.session.user_id;
    const { orderId, pdtId } = req.params;
    const { cancelledBy } = req.query;
    console.log();
    let user;
    if (!userId) {
      user = await User.findOne({ "orders._id": orderId }).populate(
        "orders.products.productId"
      );
      console.log(user);
    } else {
      user = await User.findById(userId).populate("orders.products.productId");
    }

    const order = user.orders.find((o) => o._id.toString() === orderId);

    for (const pdt of order.products) {
      if (pdt._id == pdtId) {
        if (cancelledBy == "admin") {
          pdt.status = "Cancelled By Admin";
        } else if (cancelledBy == "user") {
          pdt.status = "Cancelled";
        }
      }
    }

    await user.save();

    // console.log(pdt.status);
    if (cancelledBy == "admin") {
      res.redirect(`/admin/detailPage/${orderId}`);
    } else if (cancelledBy == "user") {
      res.redirect(`/orderDetail/${orderId}`);
    }

    // console.log();
  } catch (error) {
    console.log(error.message);
  }
};

exports.editAddress = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const { returnPage } = req.query;
    const addressId = req.params.id;
    const user = await User.findOne({ _id: userId });

    const addressData = await User.findOne(
      { _id: userId, "addresses._id": addressId },
      { addresses: 1 }
    );
    let uAddress;

    addressData.addresses.forEach((element) => {
      if (element._id == addressId) {
        uAddress = element;
      }
    });

    res.render("editAddress", {
      page: "Edit Address",
      parentPage: "user-dashboard",
      returnPage,
      address: uAddress,
      user,
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.session.user_id;
    const { name, email, mobile, town, state, country, zip, address } =
      req.body;
    const { returnPage } = req.query;
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        "addresses._id": addressId,
      },
      {
        $set: {
          "addresses.$.userName": name,
          "addresses.$.email": email,
          "addresses.$.mobile": mobile,
          "addresses.$.town": town,
          "addresses.$.state": state,
          "addresses.$.country": country,
          "addresses.$.zip": zip,
          "addresses.$.address": address,
        },
      },
      { new: true } // Return the updated document
    );

    if (returnPage == "user-dashboard") {
      res.redirect("/user-dashboard");
    } else if (returnPage == "checkout") {
      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.params.id;
    await User.updateOne(
      {
        _id: userId,
        "addresses._id": addressId,
      },
      { $pull: { addresses: { _id: addressId } } }
    );
    res.redirect("/user-dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadWalletHistory = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById({ _id: userId });
    const walletHistory = userData.wallet.transactions.reverse();
    console.log(walletHistory);
    res.render("walletHistory", {
      walletHistory: walletHistory,
      user: userData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.addToWallet = async (req, res) => {
  try {
    console.log("adding money to wallet");
    const amount = req.body.amount;
    const id = crypto.randomBytes(8).toString("hex");
    var options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "hello" + id,
    };
    instance.orders.create(options, (err, order) => {
      if (err) {
        console.log(err);
        res.json({ status: false });
      } else {
        res.json({ status: true, payment: order });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.verifyWalletpayment = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const details = req.body;

    // Accessing properties without square brackets and quotes
    console.log(details.response.razorpay_order_id);
    console.log(details.order.amount);

    const amount = parseInt(details.order.amount) / 100;
    console.log(amount);

    let hmac = crypto.createHmac("sha256", process.env.YOUR_KEY_SECRET);
    hmac.update(
      details.response.razorpay_order_id +
        "|" +
        details.response.razorpay_payment_id
    );
    hmac = hmac.digest("hex");

    if (hmac === details.response.razorpay_signature) {
      console.log("payment verified updating transactions");
      const user = await User.updateOne(
        { _id: userId }, // Query to find the user by ID
        { $inc: { "wallet.balance": amount } }
      );

      const updateTransactions = await User.updateOne(
        { _id: userId },
        {
          $push: {
            "wallet.transactions": {
              date: new Date(),
              amount: amount,
              type: "Credited Via Razorpay",
            },
          },
        }
      );

      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    const code = req.body.code;

    const couponData = await coupon.findOne({ couponCode: code });
    const userData = await User.findById(userId).populate("cart.productId");
    const cart = userData.cart;

    // Finding total cart price
    let totalPrice = 0;
    let totalDiscountPrice = 0;

    for (const pdt of cart) {
      totalPrice += pdt.productId.discountPrice * pdt.quantity;

      if (pdt.productId.offerPrice) {
        totalDiscountPrice +=
          (pdt.productId.price - pdt.productId.offerPrice) * pdt.quantity;
      } else {
        totalDiscountPrice += pdt.discountPrice * pdt.quantity;
      }
    }
    const cartAmount = totalDiscountPrice;
    if (couponData && couponData.listed) {
      if (cartAmount >= couponData.maxPrice) {
        if (couponData.expiryDate >= new Date()) {
          req.session.coupon = couponData;
          req.session.couponAmount =couponData.discountAmount   
          let payAmount;

          payAmount = cartAmount - couponData.discountAmount;

          const couponDiscount = cartAmount - payAmount;

          req.session.payAmount = payAmount;
          console.log("payAmount in session:", req.session.payAmount);

          let isWalletHasPayAmount = false;
          if (userData.wallet.balance >= payAmount) {
            isWalletHasPayAmount = true;
          }
          res.json({
            status: true,
            message: "Success",
            couponDiscount,
            payAmount,
            isWalletHasPayAmount,
          });
        } else {
          res.json({ status: false, message: "Coupon expired" });
        }
      } else {
        res.json({
          status: false,
          message: `Min purchase should be greater than or equal to ${couponData.maxPrice}`,
        });
      }
    } else {
      res.json({
        status: false,
        message: "Coupon doesn't exist or is not available",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    req.session.couponData = null;
    req.session.payAmount = null;
    req.session.couponAmount  = null;
    res.json({ status: true });
  } catch (error) {
    next(error);
  }
};

exports.checkBoxStatus = async (req, res) => {
  try {
    console.log("Status:",req.body.walletCheckBox);
    const session = req.session.user_id;
    const user = await User.findOne({ _id: session });
    req.session.walletBal = parseInt(user.wallet.balance)
    console.log("Wallet Balance:",req.session.walletBal);
  if(req.body.walletCheckBox == 'true'){
    if(req.session.payAmount)
    {
      req.session.CouponUsed = true;      
      req.session.couponDiscountedAmt = req.session.payAmount
      req.session.payAmount = req.session.payAmount - req.session.walletBal

    }else{
      req.session.payAmount = 0
      let orderTotal = 0;
      const cartItems = user.cart;
      const orderProducts = cartItems.map((item) => {
      
       orderTotal += item.quantity * item.discountPrice;
      
       
     
      });

     req.session.payAmount = orderTotal - req.session.walletBal

    }
        req.session.walletEmpty= true
      
  }else if(req.body.walletCheckBox == 'false'){

    console.log("req.session.payAmount:",req.session.payAmount);
    console.log("req.session.walletBal:",req.session.walletBal)
    req.session.payAmount = req.session.payAmount + req.session.walletBal  

  }

  res.json({status: true,
    payAmount: req.session.payAmount
})
  
} catch (error) {
  console.log(error.message);
}
}

exports.returnSinglePrdt = async (req,res) =>{
  try {
    
    let userId = req.session.user_id;
    const { orderId, pdtId } = req.params;
    console.log();
const user = await User.findById(userId).populate("orders.products.productId");

    const order = user.orders.find((o) => o._id.toString() === orderId);

    for (const pdt of order.products) {
      if (pdt._id == pdtId) {
          pdt.status = "Pending Return Approval";
        }
      }
    

    await user.save();

    // console.log(pdt.status);
      res.redirect(`/orderDetail/${orderId}`);


  } catch (error) {
    console.log(error.message);
  }
}



const updateOrderStatus = async function (orderId, next) {
  try {

          let statusCounts = []
          const orderData = await User.findOne({ _id: orderId })
          orderData.products.forEach((pdt) => {
              let eachStatusCount = {
                  status: pdt.status,
                  count: 1,
              };
          
              let existingStatusIndex = statusCounts.findIndex(
                  (item) => item.status === pdt.status
              );
          
              if (existingStatusIndex !== -1) {
                  // Increment the count of an existing status
                  statusCounts[existingStatusIndex].count += 1;
              } else {
                  statusCounts.push(eachStatusCount);
              }
          });

          if(statusCounts.length === 1){
              orderData.status = statusCounts[0].status
              await orderData.save()
              return
          }

          let isOrderConfirmedExists = false;
          let isShippedExists = false;
          let isOutForDeliveryExists = false;
          let isDeliveredExists = false;
          let cancelledByUserCount; 
          let cancelledByAdminCount;
          let returnApprovalCount;
          let returnedCount;
          statusCounts.forEach((item) => {

              if(item.status === 'Order Confimed'){
                  isOrderConfirmedExists = true
              }

              if(item.status === 'Shipped'){
                  isShippedExists = true
              }

              if(item.status === 'Out For Delivery'){
                  isOutForDeliveryExists = true
              }

              if(item.status === 'Delivered'){
                  isDeliveredExists = true
              }

              if(item.status === 'Cancelled'){
                  cancelledByUserCount = item.count
              }

              if(item.status === 'Cancelled By Admin'){
                  cancelledByAdminCount = item.count
              }

              if(item.status === 'Pending Return Approval'){
                  returnApprovalCount = item.count
              }

              if(item.status === 'Returned'){
                  returnedCount = item.count
              }
              
          });


          if(isOrderConfirmedExists){
              orderData.status = 'Order Confirmed'
              await orderData.save()
              return
          }
          
          if(isShippedExists){
              orderData.status = 'Shipped'
              await orderData.save()
              return
          }
  
          if(isOutForDeliveryExists){
              orderData.status = 'Out For Delivery'
              await orderData.save()
              return
          }
  
  
          if(isDeliveredExists){
              orderData.status = 'Delivered'
              await orderData.save()
              return
          }

          let cancelledCount = 0;
          if(cancelledByUserCount){
              cancelledCount += cancelledByUserCount
          }
          if(cancelledByAdminCount){
              cancelledCount += cancelledByAdminCount
          }

          if(cancelledByUserCount === orderData.products.length || cancelledCount === orderData.products.length){
              orderData.status = 'Cancelled'
              await orderData.save()
              return;
          }
          
          if(cancelledByAdminCount === orderData.products.length){
              orderData.status = 'Cancelled By Admin'
              await orderData.save()
              return;
          }

          if( cancelledCount + returnApprovalCount + returnedCount === orderData.products.length){
              orderData.status = 'Pending Return Approval'
              await orderData.save()
              return;
          }
  
          if( cancelledCount + returnedCount === orderData.products.length){
              orderData.status = 'Returned'
              await orderData.save()
              return;
          }

  } catch (error) {
      next(error)
  }
}











exports.downloadInvoice = async(req,res) => {
  try {
    const userId =  req.query._id
    const user =  await User.findOne(userId) 
  const orders = user.orders

  var data = {
    // Customize enables you to provide your own templates
    // Please review the documentation for instructions and examples
    "customize": {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
    },
    "images": {
        // The logo on top of your invoice
        "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
        // The invoice background
        "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
    },
    // Your own data
    "sender": {
        "company": "AudioBlast",
        "address": "Headoffice sector 12",
        "zip": "682042",
        "city": "Kakkanad",
        "country": "India"
        //"custom1": "custom value 1",
        //"custom2": "custom value 2",
        //"custom3": "custom value 3"
    },
    // Your recipient
    "client": {
        "company": "AudioBlast",
        "address": "Ernakulam Kerala India",
        "zip": "686636",
        "city": "Calicut",
        "country": "India"
        // "custom1": "custom value 1",
        // "custom2": "custom value 2",
        // "custom3": "custom value 3"
    },
    "information": {
        // Invoice number
        "number": "2021.0001",
        // Invoice data
        "date": "12-12-2021",
        // Invoice due date
        "due-date": "31-12-2021"
    },
    // The products you would like to see on your invoice
    // Total values are being calculated automatically
    "products": [
        {
            "quantity": 2,
            "description": "Product 1",
            "tax-rate": 6,
            "price": 33.87
        },
        {
            "quantity": 4.1,
            "description": "Product 2",
            "tax-rate": 6,
            "price": 12.34
        },
        {
            "quantity": 4.5678,
            "description": "Product 3",
            "tax-rate": 21,
            "price": 6324.453456
        }
    ],
    // The message you would like to display on the bottom of your invoice
    "bottom-notice": "Kindly pay your invoice within 15 days.",
    // Settings to customize your invoice
    "settings": {
        "currency": "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
        // "margin-top": 25, // Defaults to '25'
        // "margin-right": 25, // Defaults to '25'
        // "margin-left": 25, // Defaults to '25'
        // "margin-bottom": 25, // Defaults to '25'
        // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
        // "height": "1000px", // allowed units: mm, cm, in, px
        // "width": "500px", // allowed units: mm, cm, in, px
        // "orientation": "landscape", // portrait or landscape, defaults to portrait
    },
    // Translate your invoice to your preferred language
    "translate": {
        // "invoice": "FACTUUR",  // Default to 'INVOICE'
        // "number": "Nummer", // Defaults to 'Number'
        // "date": "Datum", // Default to 'Date'
        // "due-date": "Verloopdatum", // Defaults to 'Due Date'
        // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        // "products": "Producten", // Defaults to 'Products'
        // "quantity": "Aantal", // Default to 'Quantity'
        // "price": "Prijs", // Defaults to 'Price'
        // "product-total": "Totaal", // Defaults to 'Total'
        // "total": "Totaal", // Defaults to 'Total'
        // "vat": "btw" // Defaults to 'vat'
    },
};

//Create your invoice! Easy!
easyinvoice.createInvoice(data, function (result) {
    //The response will contain a base64 encoded PDF file
    console.log('PDF base64 string: ', result.pdf);
});


  } catch (error) {
    console.log(error.message);
  }
}
