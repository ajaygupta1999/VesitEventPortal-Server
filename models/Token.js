const mongoose = require('mongoose');

var TokenSchema = new mongoose.Schema({
    access_token : String,
    refresh_token : String,
    scope : String,
    token_type : String,
    expiry_date : String 
});


module.exports = mongoose.model("Token" , TokenSchema);