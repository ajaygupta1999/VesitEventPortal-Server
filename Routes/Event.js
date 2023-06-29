const express = require('express');
const { loginRequired, ensureCorrectUser } = require('../middleware/auth');
const db = require('../models');
const router =  express.Router();


router.get("/health", async function(req, res, next){
   try{
     return res.json({
        status: 200,
        message: "App is running"
     });
   }catch(err){
    return next({
        status: 500, 
        message : "Something went wrong"
      });
   }
});

// Get Specific Event Data  
router.get("/event/:eventid/getspecificevent" , async function(req , res , next){
    try{ 
       
      let event = await db.Event.findById(req.params.eventid).populate({
        path : "guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers sponsors society registrations creator", 
        populate : { path : "typeuser typeguest typeeventtaker" }
      }).exec();

      if(event){
            return res.json({
              event
            });
          
      }else{
          return next({
            message : "Event not found"
          });
      }
    }catch(err){
        console.log(err);
        return next(err);
    }
});



// Get all events details ==
router.get("/event/allevents" ,async function(req , res){
     try{
        let dballevents = await db.Event.find({}).populate({
            path : "society guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers sponsors", 
            populate : { path : "typeuser typeguest typeeventtaker" }
        }).exec();

        let allEvents = [];

        allEvents = dballevents;
        return res.json({
            allEvents
        });
         
     }catch(err){
         return next(err);
     }
});


// Create Event details ==
router.get("/event/user/:userid/event/:eventid/createdeventsdetails" , loginRequired , ensureCorrectUser , async function(req , res){
    try {
           
        // check for user admin
        let event = await db.Event.findById(req.params.eventid);
        if(event){  
             return res.json({
                 event : event
             });
   
        }else{
             return next({
                message : "Event does not exist."
             })
        }
    }catch(err){
         console.log(err);
         return next(err);
    }
});



// Register for event ==
router.post("/event/:eventid/register/user/:userid" , loginRequired , ensureCorrectUser , async function(req , res , next){
     try{
       
        let user = await db.User.findById(req.params.userid);  
        let event = await db.Event.findById(req.params.eventid);
        if( user && event ){
            console.log(event);
            let isexist = event.registrations.filter(eachuser => eachuser.toString() === user._id.toString());
            if(isexist.length === 0){
                user.registered_events.push(event._id);
                event.registrations.push(user._id);
                await user.save();
                await event.save();
                
                let updatedevent = await db.Event.findById(req.params.eventid).populate({
                    path : "guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers sponsors society registrations creator", 
                    populate : { path : "typeuser typeguest typeeventtaker" }
                }).exec();
    
                return res.json({
                    event : updatedevent 
                });
            }else{
                return next({ 
                    message : "User has already registered for this event"
                 });
            }
        }else{
            return res.json({
                event : []
            });
        }
       
     }catch(err){
         console.log(err);
         return next(err);
     }
});



// Unregister event == 
router.post("/event/:eventid/unregister/user/:userid" , loginRequired , ensureCorrectUser , async function(req , res , next){
    try{
        
       let user = await db.User.findById(req.params.userid);  
       let event = await db.Event.findById(req.params.eventid);
       let isexist = event.registrations.filter(eachuser => eachuser.toString() === user._id.toString());
       if(isexist.length === 1){
            let newuserarr = user.registered_events.filter(objid => objid.toString() !== event._id.toString());
            let neweventarr = event.registrations.filter(objid => objid.toString() !== user._id.toString());
            user.registered_events = newuserarr;
            event.registrations = neweventarr;
            await user.save();
            await event.save();

            let updatedevent = await db.Event.findById(req.params.eventid).populate({
                path : "guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers sponsors society registrations creator", 
                populate : { path : "typeuser typeguest typeeventtaker" }
            }).exec();

            return res.json({
                event : updatedevent
            });
       }else{
           return next({
               message : "It seems that, You have not registered for this event."
           });
       }
       
    }catch(err){
        console.log(err);
        return next(err);
    }
});


// Get all registered events ==
router.get("/event/user/:userid/registeredevents" , loginRequired , ensureCorrectUser , async function(req , res, next){
    try{

        let user = await db.User.findById(req.params.userid).populate("registered_events");
        if(user){
            return res.json({
                events : user.registered_events
            });
        }
        
        return res.json({
            events : []
        });
         
    }catch(err){
        console.error("Got error while getting all registered events ===> " , err.message);
        return next(err);
    }
});




module.exports = router;