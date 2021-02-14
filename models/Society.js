const mongoose = require('mongoose');

var SocietySchema = new mongoose.Schema({
    name : String,
    title : String,
    societyimage : {
        dataid : String,
        dataurl : String,
        angle : Number
    },
    societybackground : {
        dataid : String,
        dataurl : String,
        angle : Number
    },
    aboutsociety : String,
    chairperson : {
        email: String
    },
    normal_members : [{
        email : String
    }],
    council_members : [{
        email : String
    }],
    council_heads : [{
        email : String
    }],
    events : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Event"
    }],
    faculty : {
        email : String
    }
});

module.exports = mongoose.model("Society" , SocietySchema);