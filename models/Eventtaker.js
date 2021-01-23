const mongoose = require('mongoose');

var EventtakerSchema = new mongoose.Schema({
    role : String,
    details : {
        outsideperson : {
            name : String,
            profession : String
        },
        faculty : {
            name : String,
            profession : String
        },
        others : {
            name : String,
            branch : String,
            currentyear : Number,
            class : String,
        }
    },
    inevent : [{
        type:  mongoose.Schema.Types.ObjectId,
        ref : "Event"
    }]
});


module.exports = mongoose.model("Eventtaker" , EventtakerSchema);