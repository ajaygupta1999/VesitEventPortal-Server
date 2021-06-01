const express  =  require('express');
const router   =  express.Router();
const db       =  require("../models");
let SheetsHelper = require('./Sheets');
const { loginRequired , ensureCorrectUser }  = require("../middleware/auth");
const imageUpload = require("../handlers/ImageUpload");


// Get society members details ==
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


// All Events of Society ==
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


// Society Full Details ==
router.get("/:name/allData" , async function(req , res , next){
    try{
        let society =  await db.Society.findOne({name : req.params.name}).populate("events").exec();
        return res.json({
            society
        })

    }catch(err){
        return next(err);
    }
});


// Society Members full details ==
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



// Society related stuff ====>
// Update society Images -> ( Background, Society Image ) ==
router.post("/:societyname/edit/societydetails/editor/:userid" , loginRequired , ensureCorrectUser, 
         imageUpload.upload.fields([ {name : "societyimage" }, {name : "societybackground"} ]) ,  async function(req , res , next){
  try{
      let societyimage = {};
      let societybackground = {};
      for(let i = 0 ; i < 2 ; i++){
          if(i === 0){
            if(Object.keys(req.files).length > 0){
              if(req.files['societyimage']){
                  societyimage = await imageUpload.fileUpload(req.files['societyimage'][0]);
              }
            }
          }

          if(i === 1){
            if(Object.keys(req.files).length > 0){
              if(req.files['societybackground']){
                societybackground = await imageUpload.fileUpload(req.files['societybackground'][0]);
              }
            }
          }
      }

      let society = await db.Society.findOne({ name : req.params.societyname });
      if(society){
          society.name = req.body.name;
          if(Object.keys(societyimage).length > 0){
            society.societyimage = societyimage;
          }

          if(Object.keys(societybackground).length > 0){
            society.societybackground = societybackground;
          }

          society.title = req.body.title;
          await society.save();

          return res.json({
            society : society
          });
      }

      return next({
        message : "Society not found."
      });
  
  }catch(err){
      console.log(err);
      return next(err);
  }
});


// Update Society details -> ( About Society ) == 
router.post("/:societyname/edit/aboutsociety/editor/:userid" , loginRequired , ensureCorrectUser ,  async function(req , res , next){
  try{
      
      // Permission to Edit council head and faculty and chairperson
      let society = await db.Society.findOne({ name : req.params.societyname });
      if(society){
          if(society.aboutsociety !== req.body.aboutsociety){
             society.aboutsociety = req.body.aboutsociety;
             await society.save();
          }

          return res.json({
            society : society
          });
      }

      return next({
        message : "Society not found."
      });
  
  }catch(err){
      console.log(err);
      return next(err);
  }
});


// Update Society details -> ( Faculty and Chairperson ) ==
router.post("/:societyname/edit/facultyorchairperson/editor/:userid" , loginRequired , ensureCorrectUser , async function(req , res , next){
    
    try{
       let society = await db.Society.findOne({name : req.params.societyname});
       if(society){
            if(req.body.roletype === "chairperson"){
                society.chairperson = {
                  email : req.body.chairperson.email
                }
            }

            if(req.body.roletype === "faculty"){
              society.faculty = {
                email : req.body.faculty.email
              }
            }

            await society.save();
            return res.json({
               society
            });

       }else{
          return next({
            message : "Society not found."
          });
       }

    }catch(err){
      console.log(err);
      return next(err);
    }
     
});
 


module.exports = router;