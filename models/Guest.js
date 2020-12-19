const mongoose = require('mongoose');

var GuestSchema = new mongoose.Schema({
    name : String,
    profession : String,
    description : String
});


module.exports = mongoose.model("Guest" , GuestSchema);