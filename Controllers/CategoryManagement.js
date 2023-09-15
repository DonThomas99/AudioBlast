const category = require('../Models/categoryModel');

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

      const nameRegex = /^[a-zA-Z ]+/; 

      console.log("entering addition");
      //console.log(req.body.name);
      const newcategory = new category({
        name:req.body.name.trim().toUpperCase(),
        is_unlisted : req.body.is_unlisted
       
      })
  
    const categName = newcategory.name;
    console.log(categName);

    const existingcateg = await category.findOne({name:categName});
    console.log(existingcateg);
    
    if (existingcateg) {
      res.render('addcategory', { message: "Category already registered" });
    } else if (!nameRegex.test(categName)) {
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
      const catData = await category.findById(id);
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