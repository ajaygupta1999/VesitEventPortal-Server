const express  =  require('express');
const router   =  express.Router();
const db       =  require("../models");


router.get("/:name/allmembers" , async function(req , res , next){
    try{
        let society =  await db.Society.findOne({name : req.params.name}).populate("normal_member council_members council_head facult_details").exec(); 
        const { normal_member , council_members , council_head , facult_details , name } = society;
        return res.json({
            normal_member,
            council_members,
            council_head,
            facult_details
        });
    }catch(err){
        return next(err);
    }
});

router.get("/:name/allevents" , async function(req , res , next){
    try{
        let society = await db.Society.findOne({name : req.params.name}).populate("events").exec();
        let { events } = society;

        return res.json({
            events
        }); 

    }catch(err){
        return next(err);
    }
});

router.get("/:name/allData" , async function(req , res , next){
    try{
        console.log("Getting Done");
        let society =  await db.Society.findOne({name : req.params.name}).populate("normal_member council_members council_head facult_details events").exec();
        return res.json({
            society
        })

    }catch(err){
        return next(err);
    }
});

module.exports = router;