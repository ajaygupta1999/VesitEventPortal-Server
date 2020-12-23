const express = require('express');
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




module.exports = router;