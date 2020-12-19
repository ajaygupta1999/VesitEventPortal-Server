const mongoose = require('mongoose');

var SocietySchema = new mongoose.Schema({
    name : String,
    normal_member : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    council_members : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User" 
    }],
    council_head : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "User"
    },
    events : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Event"
    }],
    facult_details : {
        name : String,
        description : String
    }
});

module.exports = mongoose.model("Society" , SocietySchema);