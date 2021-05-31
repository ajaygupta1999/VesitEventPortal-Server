const express = require('express');
const router =  express.Router();
const db      = require("../models");
const jwt             = require('jsonwebtoken');
const { loginRequired , ensureCorrectUser }  = require("../middleware/auth");
const imageUpload = require("../handlers/ImageUpload");



// Get specific user profile data ==
router.get("/:userid/getspecificuser" , async function(req , res , next){
   try{
      
      let user = await db.User.findById(req.params.userid); 
      let populateddata = await db.User.findById(req.params.userid).populate({
          path : "registered_events",
          populate : { path : "guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers" ,
          populate : { path : "typeuser typeguest typeeventtaker" } }
      }).exec();

      let registeredevents = [];
      if(user.registered_events){
          registeredevents = populateddata.registered_events;
      }
      
      if(user){
           return res.json({
              userdata : user,
              registeredevents
           });
      }else{
         return next({
            message : "User not found"
         });
      }
   }catch(err){
      console.log(err);
      return next({ 
        message :  err.message 
      });
   }
});



// Get specific society details == 
router.get("/:userid/fetch/societydeails" , loginRequired , ensureCorrectUser , async function(req , res , next) {
     try{
        
        let user = await db.User.findById(req.params.userid);
        if(user){
            let useremail = user.email;
            let count = 0;
            let allsociety = await db.Society.find({});
            let societydeailsarr = [];
            for(let i = 0 ; i < allsociety.length ; i++){
                    
                  let filtered_normal_member = allsociety[i].normal_members.filter(emailobj => emailobj.email === useremail );
                  if(filtered_normal_member.length > 0){
                      let societydetails = {};
                      societydetails.name = allsociety[i].name;
                      societydetails.role = "normal-member";
                      societydeailsarr.push(societydetails);
                      count++;
                  }

                  let filtered_council_member = allsociety[i].council_members.filter(emailobj => emailobj.email === useremail);
                  if(filtered_council_member.length > 0){
                    let societydetails = {};
                    societydetails.name = allsociety[i].name;
                    societydetails.role = "council-member";
                    societydeailsarr.push(societydetails);
                    count++;
                  }

                  let filtered_council_head = allsociety[i].council_heads.filter(emailobj => emailobj.email === useremail);
                  if(filtered_council_head.length > 0){
                    let societydetails = {};
                    societydetails.name = allsociety[i].name;
                    societydetails.role = "council-head";
                    societydeailsarr.push(societydetails);
                    count++;
                  }

                  if(allsociety[i].faculty.email === useremail){
                      let societydetails = {};
                      societydetails.name = allsociety[i].name;
                      societydetails.role = "faculty";
                      societydeailsarr.push(societydetails);
                      count++;
                  }
            }
            
           return res.json({
             insociety : count,
             societydetails : societydeailsarr
           });

        }else{
            return next({
              message : "User does not exist"
            })
        }

     }catch(err){
         console.log(err);
         return next(err);
     }
});


// Get all users details == 
router.get("/:userid/getallusers" , loginRequired , ensureCorrectUser , async function(req , res , next){
   try{

      // Only admins can get this data ===>
      let [guests , eventtakers , users] = await Promise.all([db.Guest.find({}) , db.Eventtaker.find({}) , db.User.find({}) ]);
      
      return res.json({
        allusers : {
            guests : guests,
            eventtakers : eventtakers,
            users : users
          }
      });
    
   }catch(err){
     console.log(err.message);
     return next(err);
   }
});


// router.post("/:userid/create/personaldetails" , loginRequired , ensureCorrectUser , imageUpload.upload.single('image') , async function(req , res , next){
//       try{
//         const { firstname , lastname , phonenum } = req.body;
//         let imgobj = await imageUpload.fileUpload(req.file);
        
//         let user = await db.User.findById(req.params.userid);
//         user.username = firstname + " " + lastname,
//         user.firstname = firstname;
//         user.lastname = lastname;
//         user.phonenum = phonenum;
//         user.imgurl = imgobj;
//         await user.save();

//         let userdata = {
//             username : user.username,
//             firstname : user.firstname,
//             lastname : user.lastname,
//             imgurl : user.imgurl,
//             _id : user._id,
//             email : user.email,
//         }

//         let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
//         return res.json({
//           token,
//           userdetails : userdata
//         });

//       }catch(err){
//           return next({
//                 message : err.message
//           });
//       }
// });




// Create class and Society details of user == 
router.post("/:userid/create/classandsociety" , loginRequired , ensureCorrectUser , async function(req , res , next){
    try{
      
      let user = await db.User.findById(req.params.userid);
      if(user){
          user.role = req.body.role;
          if(req.body.role === "student"){
            user.classdetails = {
                department : req.body.department,
                class : req.body.class,
                rollno : Number(req.body.rollno),
                currentyearofstudy : Number(req.body.currentyear),
                semester : Number(req.body.semester)
            }
            
            user.societydetails = {
                name : req.body.society,
                role : req.body.societyrole
            } 

            if(req.body.societyrole !== "faculty"){
                user.societydetails.specificrole = req.body.specificrole;
            }
         }else{
            user.societydetails = {
                name : req.body.society,
                role : req.body.societyrole
            }
         }

         await user.save();
      }
       

      

      // Setting up society details
      if(req.body.society === "ieee" || req.body.society === "iste" || req.body.society === "isa" || req.body.society === "csi" ){
          let dbsociety = await db.Society.findOne({name : req.body.society});
          if(req.body.societyrole === "normal-member"){
              dbsociety.normal_members.push({ email : user.email });
          }

          if(req.body.societyrole === "council-member"){
              dbsociety.council_members.push({ email : user.email });
          }

          if(req.body.societyrole === "council-head"){
            dbsociety.council_heads.push({ email : user.email });
          }


          if(req.body.societyrole === "faculty"){
              dbsociety.faculty.email = user.email;
          }
          
          await dbsociety.save();
          console.log("Society ===> " , dbsociety);
      }
      

      console.log("User ===> " , user);
      
      let userdata = {
         id : user._id 
      }

      let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
      return res.json({
        token,
        userdetails : user
      });

    }catch(err){
      console.log(err);
        return next({
              message : err.message
        });
    }
});



// User profile update =======>
   //  personaldetails  =======

router.post("/:userid/edit/profile/personaldetails" , loginRequired , ensureCorrectUser , imageUpload.upload.single("image") , async function(req ,res , next){
   try{
      
      let user = await db.User.findById(req.params.userid);
      if(user){
              let imgobj = {};
              console.log("File found" , req.file);
              if(req.file){
                  imgobj = await imageUpload.fileUpload(req.file);
              }
              user.firstname = req.body.firstname;
              user.lastname = req.body.lastname;
              user.username = req.body.firstname + "  " + req.body.lastname;
              if(req.file){
                user.imgurl = imgobj;
              }
              await user.save();

              let userdata = {
                 id  : user._id
              }
                
            let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
            return res.json({ 
                token,
                userdetails : user
            });     

      }else{
        return next({
          message : "User not found"
        })
      }
   }catch(err){
       console.log(err);
       return next(err);
   }
});


// Update User's Society details ( Specific Role ) ==
router.post("/:userid/edit/profile/societydetails" , loginRequired , ensureCorrectUser , async function(req ,res , next){
  try{
     
     let user = await db.User.findById(req.params.userid);
    
     if(user){
              if(req.body.role === "student"){
                if(user.societydetails.role !== "faculty"){
                      user.societydetails.specificrole = req.body.specificrole;
                      await user.save();

                      let userdata = {
                        id : user._id
                      }

                    let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
                    return res.json({ 
                        token,
                        userdetails : user
                    }); 
                }else{
                  return next({
                    message : "Doing Something wrong."
                  })
                }
              }else{

                 return next({
                   message : "You are not allowed to do this action."
                 });
              }   

     }else{
       return next({
         message : "User not found"
       })
     }
  }catch(err){
      console.log(err);
      return next(err);
  }
});


// Update class and society details of user ==
router.post("/:userid/edit/profile/classdetails" , loginRequired , ensureCorrectUser , async function(req ,res , next){
  try{
     
     let user = await db.User.findById(req.params.userid);
    
     if(user){
              user.classdetails = {
                department : req.body.department,
                class : req.body.class,
                rollno : Number(req.body.rollno),
                semester : Number(req.body.semester),
                currentyearofstudy : Number(req.body.currentyear) 
              }

              await user.save();

              let userdata = {
                id : user._id
              }

            let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
            return res.json({ 
                token,
                userdetails : user
            }); 
     }else{
       return next({
         message : "User not found"
       });
     }
  }catch(err){
      console.log(err);
      return next(err);
  }
});





module.exports = router;