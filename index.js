require('dotenv').config();
var express              = require('express'),
    app                  = express(),
    cors                 = require('cors'),
    bodyParser           = require('body-parser'),
    errorHandler         = require("./handlers/error"),
    authRoutes           = require("./Routes/Auth"),
    userRoutes           = require('./Routes/User'),
    eventRoutes          = require("./Routes/Event"),
    societyRoutes        = require("./Routes/Society"),
    populateRoutes       = require("./Routes/Populate"),
    createEventRoutes    = require("./Routes/CreateEvent"),
    societyManageMembersRoutes = require("./Routes/SocietyManageMembers");



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cors());



// All routes is Here ....
// app.use("/api/populatedata" ,  populateRoutes);
app.use("/api/auth" , authRoutes);
app.use("/api/createevent" , createEventRoutes);
app.use("/api/user" , userRoutes);
app.use("/api/society" , societyRoutes);
app.use("/api/society" , societyManageMembersRoutes);
app.use("/api/" , eventRoutes);


// Error handling
app.use(function(req , res , next) {
      let err = new Error("Not found");
      err.status = 404;
      next(err);
});

app.use(errorHandler);

// Port setup
app.listen(process.env.PORT || 8081 , function(){
	console.log("server started......");
});