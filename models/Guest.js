const mongoose = require('mongoose');

var GuestSchema = new mongoose.Schema({
    name : String,
    profession : String,
    description : String,
    inevent : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Event"
    }]
});


module.exports = mongoose.model("Guest" , GuestSchema);