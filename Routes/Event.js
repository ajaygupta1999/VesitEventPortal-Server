const express = require('express');
const { loginRequired, ensureCorrectUser } = require('../middleware/auth');
const db = require('../models');
const router =  express.Router();



router.get("/event/allevents" ,async function(req , res){
     try{

        let dballevents = await db.Event.find({}).populate({
            path : "guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers sponsors", 
            populate : { path : "typeuser typeguest typeeventtaker" }
        }).exec();

        let allEvents = [];

        allEvents = dballevents;
        return res.json({
            allEvents
        });
        
        // dballevents.forEach(async function(dbevent){
        //     var eventobj = {
        //         id : dbevent._id,
        //         name : dbevent.name,
        //         date : dbevent.date,
        //         time : dbevent.time,
        //         category : dbevent.category,
        //         imgurl : dbevent.imgurl,
        //         shortdesc : dbevent.shortdesc,
        //         fulldesc : dbevent.fulldesc,
        //     }
        //     await allEvents.push(eventobj);
        // });
         
     }catch(err){
         return next(err);
     }
    
});

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