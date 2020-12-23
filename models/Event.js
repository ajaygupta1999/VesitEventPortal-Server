const mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
   name : String,
   date: String,
   time : String,
   shortdesc : String,
   fulldesc : String,
   category : String,
   imgurl : {
        dataid : String,
        dataurl : String,
        angle : Number
   },
   creator : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
   },
   registrations : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
   }],
   society : {
       type : mongoose.Schema.Types.ObjectId,
       ref : "Society"
   },
   guest : [{
       type : mongoose.Schema.Types.ObjectId,
       ref : "Guest"
   }],
   sponsor : [{
       type : mongoose.Schema.Types.ObjectId,
       ref : "Sponsor"
   }],
   eventtaker : {
       registered_eventtaker : [{
           role : String,
           takers : [{
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
           }]
       }],
       unregistered_eventtaker : [{
           role : String,
           takers : [{
                type : mongoose.Schema.Types.ObjectId,
                ref : "Eventtaker"
           }]
       }]
   },
   certificateurl : [{
        dataid : String,
        dataurl : String  
   }]
});



module.exports = mongoose.model("Event" , EventSchema);