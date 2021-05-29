require('dotenv').config();
var express          = require('express'),
    app              = express(),
    cors             = require('cors'),
    bodyParser       = require('body-parser'),
    errorHandler     = require("./handlers/error"),
    authRoutes       = require("./Routes/Auth"),
    userRoutes       = require('./Routes/User'),
    eventRoutes       = require("./Routes/Event"),
    societyRoutes      = require("./Routes/Society");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cors());





app.use("/" , async function(req , res , next){
    try{
        return res.json({ message : "Server is running" });
    }catch(err){
        return next({
            message : "Got error"
        })
    }
});


// All routes is Here .... 
app.use("/api/auth" , authRoutes);
app.use(userRoutes);
app.use("/api/society" , societyRoutes);
app.use("/api/" , eventRoutes);


// Error handling
app.use(function(req , res , next) {
      let err = new Error("Not found");
      err.status = 404;
      next(err);
});

app.use(errorHandler);

// Port setup
app.listen(process.env.PORT || 8000 , function(){
	console.log("server started......");
});