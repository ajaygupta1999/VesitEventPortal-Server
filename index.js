require('dotenv').config();
var express          = require("express"),
    app              = express(),
    mongoose         = require("mongoose"),
    User             = require("./models/User.js");


// Database setup
mongoose.connect(process.env.DATABASEURL , { useNewUrlParser: true  , useCreateIndex : true , seUnifiedTopology: true } , function(err){
    console.log(err);
});   



app.get("/" , function(req , res){
    res.send("All data you will get here..");
});

app.get("/createuser" , async function(req , res){
    try{
        let userobj = {
            username : "2018.ajay",
            firstname : "Ajay",
            lastname:  "Gupta"
        } 
        let user = await User.create(userobj);
        console.log(user);
        res.send(user);
        
    }catch(err){
        res.send(err);
        console.log(err);
    }
});

app.get("/google" , function(req ,res){
    res.send("This data is comming from sever. Which is running on port 8080");
});

// Port setup
app.listen(8081 , function(){
	console.log("server started......");
});