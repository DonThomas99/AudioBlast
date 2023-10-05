const Product = require('../Models/productModel');

const {ObjectId} = require("mongodb")

const category  = require('../Models/categoryModel');

//Products and its actions

exports.productsList= async(req,res)=>{
    try {
   const productData = await Product.find({}).populate('category')
   
   res.render('productList',{pdts:productData})  
    } catch (error) {
      console.log(error.message);
    }
    
  }
  
  exports.addProduct= async(req,res)=>{
    try {
      const category1 = await category.find({is_unlisted:1})
        res.render('addProduct',{data:category1})
      } catch (error) {
        console.log(error.message);
      }
  }
  exports.addProducty = async(req,res)=>{
    try { 
      
        const {name,price,actualPrice,discountPrice,brand,connectivity,stock,description,category1} = req.body
      console.log(connectivity);
      
      const categoryFound =  await category.findOne({name:category1}) 
    
      const image = req.files
     
    //   for(i=0;i<req.files.length;i++){
    //     image[i] = req.files[i].filename
    //   }  
      
      const data = new Product({
        productName : name,
        price : price,
        image : image,
        brand : brand,
        connectivity : connectivity,
        date: new Date, 
        actualPrice : actualPrice,
        stock : stock,
        description : description,
        category : categoryFound._id, 
        discountPrice : discountPrice
     })  

 const result = await data.save()
 if(result){
    res.redirect('/admin/productList')
 }
    } catch (error) {
      console.log(error.message);
    }
  }


  exports.unlistProduct = async(req,res)=>{
    try {
  
  const id = req.params.id 
  console.log(id);
  const pdt = await Product.findById(id)
console.log("is_unlisted:",pdt.isUnlisted);
  if(pdt){
  pdt.isUnlisted =!pdt.isUnlisted;
  
  await pdt.save()
  console.log("is_unlisted:",pdt.isUnlisted);
  }
  else{
    console.log('user not found');
  }
  
res.redirect('/admin/productList')
} catch (error) {
  console.log(error.message);
       }
  }


  exports.editProduct= async(req,res)=>{
    try{

     
      const category1 =await category.find({is_unlisted:1})
      const id = req.query.id;
    
      const pdtData = await Product.findById(id);
      console.log(pdtData);
      const categorySelected = await category.findById(pdtData.category);
      console.log(categorySelected);
      if(pdtData){
        res.render('editproduct',{data:pdtData,category:category1,categorySelected})
      }
    }
    catch(error){
      console.log(error.message)
    }
  }

  exports.editProducty = async(req, res)=>{
    try {
          
        const id  = req.query.id
  console.log(id);
        const image = req.files
        
        const {name,price,brand,connectivity,actualPrice,discountPrice,stock,description,category1} = req.body
        
       
        const categoryFound =  await category.findOne({name:category1}) 
     
        const pdtData = await Product.findByIdAndUpdate({_id:id},{$push:{image:{$each:image}},$set:{
            productName : name,
            price : price,
            actualPrice: actualPrice,
            discountPrice: discountPrice,
            brand:brand,
            connectivity:connectivity,
            actualPrice : actualPrice,
            stock : stock,
            description : description,
            category : categoryFound._id, 
            discountPrice : discountPrice  }      
        })
      
        res.redirect('/admin/productList')
    } catch (error) {
        
    }
     
  }

  exports.deletimage = async(req,res)=>{
    try { console.log("deleting image");
        const id = req.query.id
        const imageURL = req.query.imageURL
       await Product.findByIdAndUpdate({_id:id}, {$pull:{image:{filename:imageURL}}})
       console.log("uyfygf");
        res.redirect(`/admin/editProducts?id=${id}`)
    } catch (error) {
        console.log(error.message);
    }
  } 