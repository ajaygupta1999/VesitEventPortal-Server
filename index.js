require('dotenv').config();
var express          = require('express'),
    app              = express(),
    cors             = require('cors'),
    bodyParser       = require('body-parser'),
    errorHandler     = require("./handlers/error"),
    authRoutes       = require("./Routes/Auth"),
    userRoutes       = require('./Routes/User'),
    eventRoutes       = require("./Routes/Event");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cors());

// All routes is Here .... 
app.use("/api/auth" , authRoutes);
app.use(userRoutes);
app.use("/api/" , eventRoutes);


// Error handling
app.use(function(req , res , next) {
      let err = new Error("Not found");
      err.status = 404;
      next(err);
});

app.use(errorHandler);

// Port setup
app.listen(8000 , function(){
	console.log("server started......");
});