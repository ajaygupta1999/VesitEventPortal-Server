const mongoose = require('mongoose');

var SponsorSchema = new mongoose.Schema({
    sponsorname : String,
    imgurl : {
        dataid : String,
        dataurl : String,
        angle : Number
    },
    description : String,
    certificateurl : {
        dataid : String,
        dataurl : String,
        angle : Number
    },
    inevent : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Event"
    }]
    
});


module.exports = mongoose.model("Sponsor" , SponsorSchema);