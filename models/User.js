var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    username : String,
    firstname : String,
    lastname : String,
    googleid : String,
    phonenum : Number,
    imgurl : {
        dataid : String,
        dataurl : String,
        angle : Number
    },
    role : String, 
    email : {
        type : String,
        unique : true,
        required : true
    },
    classdetails : {
        department : String,
        class : String,
        rollno : Number,
        currentyearofstudy : Number,
        semester : Number
    },
    societydetails : {
        name : String,
        role : String
    },
    registered_events : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Event"
    }]

});

module.exports = mongoose.model("User" , UserSchema);