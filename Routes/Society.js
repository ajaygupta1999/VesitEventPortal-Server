const express  =  require('express');
const { loginRequired, ensureCorrectUser } = require('../middleware/auth');
const router   =  express.Router();
const db       =  require("../models");
const { ensureIndexes } = require('../models/User');


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
        let society =  await db.Society.findOne({name : req.params.name}).populate("normal_member council_members council_head facult_details events").exec();
        return res.json({
            society
        })

    }catch(err){
        return next(err);
    }
});

router.get("/:societyid/get/membersfulldetails" , async function(req , res , next){
    try{
        let normal_members = [];
        let council_members = [];
        let council_heads = [];
        let faculty = {};
        let chairperson = {};
        let society = await db.Society.findById(req.params.societyid);
        if(society){

            if(society.normal_members){
                for(let i = 0 ; i < society.normal_members.length ; i++){
                    let user = await db.User.findOne({ email : society.normal_members[i].email });
                    if(user){
                        await normal_members.push(user);
                    }else{
                        await normal_members.push(society.normal_members[i]);
                    }
                }
            }

            if(society.council_members){
                for(let j = 0 ; j < society.council_members.length ; j++){
                    let user = await db.User.findOne({ email : society.council_members[j].email });
                    if(user){
                        await council_members.push(user);
                    }else{
                        await council_members.push(society.council_members[j]);
                    }
                }
            }

            if(society.council_heads){
                for(let k = 0 ; k < society.council_heads.length ; k++){
                    let user = await db.User.findOne({ email : society.council_heads[k].email });
                    if(user){
                        await council_heads.push(user);
                    }else{
                        await council_heads.push(society.council_heads[k]);
                    }
                }
            }

            if(society.faculty){
                let user = await db.User.findOne({ email : society.faculty.email });
                if(user){
                    faculty = user;
                }else{
                    faculty = society.faculty;
                }
            }

            if(society.chairperson){
                let user = await db.User.findOne({ email : society.chairperson.email });
                if(user){
                    chairperson = user;
                }else{
                    chairperson = society.chairperson;
                }
            }
            
            return res.json({
                normal_members,
                council_members,
                council_heads,
                faculty,
                chairperson
            });
        }

        return next({
            message : "Society not found."
        })

    }catch(err){
        console.log(err);
        return next(err);
    }
});



module.exports = router;