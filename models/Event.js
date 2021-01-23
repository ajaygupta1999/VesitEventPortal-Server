const mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
   name : String,
   date: String,
   time : String,
   shortdesc : String,
   fulldesc : "Buffer",
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
   guests : {
        registered_guests : {
            typeuser : [{
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }],
            typeguest : [{
                type : mongoose.Schema.Types.ObjectId,
                ref : "Guest"
            }] ,
            typeeventtaker : [{
                type : mongoose.Schema.Types.ObjectId,
                ref : "Eventtaker"
            }]
        },
        unregistered_guests : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Guest"
        }]
   },
   sponsors : [{
       type : mongoose.Schema.Types.ObjectId,
       ref : "Sponsor"
   }],
   eventtakers : {
        registered_eventtakers : {
            typeuser : [{
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }],
            typeguest : [{
                type : mongoose.Schema.Types.ObjectId,
                ref : "Guest"
            }] ,
            typeeventtaker : [{
                type : mongoose.Schema.Types.ObjectId,
                ref : "Eventtaker"
            }]
        },
        unregistered_eventtakers : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Eventtaker" 
        }]
   },
   certificateurl : [{
        dataid : String,
        dataurl : String  
   }]
});



module.exports = mongoose.model("Event" , EventSchema);