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
        email: String,
        name: String
    },
    normal_members : [{
        email : String,
        name : String
    }],
    council_members : [{
        email : String,
        name : String,
        role : String,
        specificrole : String
    }],
    council_heads : [{
        email : String,
        name : String
    }],
    events : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Event"
    }],
    faculty : {
        email : String,
        name : String
    },
    token : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Token"
    },
    spreadsheets : {
        useremail : String,
        sheetid : String,
        council_member : {
            sheetid : String
        },
        normal_members : {
            sheetid : String
        },
        facultyorchairperson : {
            sheetid : String
        } 
    }
});

module.exports = mongoose.model("Society" , SocietySchema);