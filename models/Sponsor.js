const mongoose = require('mongoose');

var SponsorSchema = new mongoose.Schema({
    sponsorname : String,
    imgurl : String,
    description : String,
    certificateurl : String
});


module.exports = mongoose.model("Sponsor" , SponsorSchema);