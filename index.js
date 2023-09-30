const mongoose = require('mongoose');
require("dotenv").config();
const mongoURI = process.env.MONGODB_URI;
//mongoose.connect()
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, w: 'majority' })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error during connecting to MongoDB', err);
    });

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
