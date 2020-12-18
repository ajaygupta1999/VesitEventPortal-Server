require('dotenv').config();
var express                 = require("express"),
    app                     = express();


app.get("/google" , function(req ,res){
    res.send("This data is comming from sever. Which is running on port 8080");
});

// Port setup
app.listen(8081 , function(){
	console.log("server started of instapic app......");
});