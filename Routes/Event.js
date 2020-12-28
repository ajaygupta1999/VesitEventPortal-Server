const express = require('express');
const { loginRequired, ensureCorrectUser } = require('../middleware/auth');
const db = require('../models');
const router =  express.Router();



router.get("/event/allevents" ,async function(req , res){
     try{
        let dballevents = await db.Event.find({});
        let allEvents = [];
        dballevents.forEach(async function(dbevent){
            var eventobj = {
                id : dbevent._id,
                name : dbevent.name,
                date : dbevent.date,
                time : dbevent.time,
                category : dbevent.category,
                imgurl : dbevent.imgurl,
                shortdesc : dbevent.shortdesc,
                fulldesc : dbevent.fulldesc,
            }
            await allEvents.push(eventobj);
        });
        return res.json({
            allEvents
        });  
     }catch(err){
         return next(err);
     }
    
});

router.get("/event/:eventid/register/user/:id" , loginRequired , ensureCorrectUser , async function(req , res , next){
     try{

        let user = await db.User.findById(req.params.id);  
        let event = await db.Event.findById(req.params.eventid);
        user.registered_events.push(event);
        event.registrations.push(user);
        user.save();
        event.save();

        return res.json({
            user,
            event
        });

     }catch(err){
         console.log(err);
         return next(err);
     }
});




module.exports = router;