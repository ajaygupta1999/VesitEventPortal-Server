const mongoose = require('mongoose');

var EventtakerSchema = new mongoose.Schema({
    role : String,
    details : {
        guest : {
            name : String,
            profession : String,
            description : String
        },
        faculty : {
            name : String,
            description : String
        },
        others : {
            name : String,
            branch : String,
            currentyear : Number,
            class : String,
        }
    }
});


module.exports = mongoose.model("Eventtaker" , EventtakerSchema);