const mongoose = require('mongoose');
//mongoose.connect()
const connection =()=>{
    const URL = "mongodb+srv://donbrototype:URQPakhFxSet1Vn9@cluster0.bh5afjy.mongodb.net/AB?retryWrites=true&w=majority"
    try {
        mongoose.connect(URL,{useUnifiedTopology: true,useNewUrlParser :true })
        console.log("Database connected");
    } catch (error) {
        console.log(error.messsage);
        console.log("error found in try of connection");
    }
}
connection()

const express = require('express');
const path = require('path');
const nocache = require('nocache');

const app = express()
app.use(nocache())


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set('view engine','ejs')


app.use('/static', express.static(path.join(__dirname,'public')))

//app.use('/static', express.static(path.join(__dirname,'public/boAt-images')))

//for user routes
const userRoute = require("./routes/userRoute")
app.use('/',userRoute)

//for admin routes
const adminRoute = require("./routes/adminRoute")
app.use('/admin',adminRoute)


app.listen(3000,function(){
    console.log("server is running at http://localhost:3000");
})
