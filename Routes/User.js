const express = require('express');
const router =  express.Router();
const multer    = require("multer");
const db      = require("../models");
const cloudinary = require('cloudinary');
const sharp      = require("sharp");
const sizeOf       = require("image-size");
const jwt             = require('jsonwebtoken');
const { loginRequired , ensureCorrectUser }  = require("../middleware/auth");
const Sponsor = require('../models/Sponsor');
const utf8      = require("utf8");
const { events } = require('../models/Sponsor');
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');
const download = require("download");

// storage file name from multer 
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
      callback(null, Date.now() + file.originalname);
    }
});
  
// checks and only allow images 
var imageFilter = function (req, file, cb) {
      // accept image files only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
};
  
var upload = multer({ storage: storage, fileFilter: imageFilter});
  
// cloudinary config
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get("/api/event/:eventid/getspecificevent" , async function(req , res , next){
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


router.get("/api/user/:userid/getspecificuser" , async function(req , res , next){
   try{

      let user = await db.User.findById(req.params.userid);
       
      let usersec = await db.User.findById(req.params.userid).populate({
          path : "registered_events",
          populate : { path : "guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers" ,
          populate : { path : "typeuser typeguest typeeventtaker" } }
      }).exec();

      let registeredevents = [];
      if(usersec.registered_events){
          registeredevents = usersec.registered_events;
      }
      
       if(user){
           return res.json({
             userdata : user,
             registeredevents
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


router.get("/create/guest" , async function(req , res , next){
   try{
   
       let dataarr = [{
            role : "outsideperson",
            details : {
              outsideperson : {
                name : "Ajay Gupta",
                profession : "I am a student"
              }
            }
        } , 
        {
            role : "faculty",
            details : {
              faculty : {
                name : "Vijay Gupta",
                profession : "I am a student"
              }
            }
        },
        {
          role : "others",
          details : {
            others : {
              name : "Ajay Gupta",
              class : "D12C",
              branch : "CMPN",
              currentyear : 3
            }
          }
        }];
        
        let createdguest;
        dataarr.forEach(async eachguest => {
              createdguest = await db.Guest.create(eachguest);
        });

        return res.json({
          message : "Guests created successfully"
        })
        
     

   }catch(err){
      return next({
        message : "got error while creating guest"
      });
   }
});

router.get("/create/eventtaker" , async function(req , res , next){
  try{
  
      let dataarr = [{
           role : "outsideperson",
           details : {
             outsideperson : {
               name : "Ajay Gupta",
               profession : "I am a student"
             }
           }
       } , 
       {
           role : "faculty",
           details : {
             faculty : {
               name : "Vijay Gupta",
               profession : "I am a student"
             }
           }
       },
       {
         role : "others",
         details : {
           others : {
             name : "Ajay Gupta",
             class : "D12C",
             branch : "CMPN",
             currentyear : 3
           }
         }
       }];
       
       let createdeventtaker;
       dataarr.forEach(async eacheventtaker => {
           createdeventtaker = await db.Eventtaker.create(eacheventtaker);
       });

       return res.json({
         message : "Eventtakers created successfully"
       });
       
  }catch(err){
     return next({
       message : "got error while creating Eventtaker"
     });
  }
});


router.get("/create/society" , async function(req , res , next){
    try{
        
        let societyobj1 = {
          name : "ieee",
          title : "Greatest society of all time.",
          aboutsociety : "<p>ISTE vesit</p>",
          chairperson : {
            email : "2018.ajay.gupta@ves.ac.in"
          },
          normal_members : [
             {
               email : "2018.ajay.gupta@ves.ac.in"
             },
             {
               email : "ajay.u.gupta14@gmail.com"
             }
          ],
          council_members : [
             {
               email : "vesiteventsportal@gmail.com"
             }
          ],
          council_heads : [
             {
               email : "ajayupendragupta14@gmail.com"
             }
           ],
           faculty : {
             email : "instapicwebsite@gmail.com"
           } 
       }
       await db.Society.create(societyobj1);
        
       let societyobj2 = {
          name : "csi",
          title : "Greatest society of all time.",
          aboutsociety : "<p>CSI vesit</p>",
          chairperson : {
            email : "2018.ajay.gupta@ves.ac.in"
          },
          normal_members : [
            {
              email : "ajay@gmail.com"
            }
          ],
          council_members : [
            {
              email : "vijay@gmail.com"
            }
          ],
          council_heads : [
            {
              email : "ajayup@gmail.com"
            }
          ],
          faculty : {
            email : "instapicwebsiteapp@gmail.com"
          } 
       }
       await db.Society.create(societyobj2);

       let societyobj3 = {
          name : "iste",
          title : "Greatest society of all time.",
          aboutsociety : "<p>ISTE vesit</p>",
          chairperson : {
            email : "2018.ajay.gupta@ves.ac.in"
          },
          normal_members : [
            {
              email : "aj@gmail.com"
            }
          ],
          council_members : [
            {
              email : "vi@gmail.com"
            }
          ],
          council_heads : [
            {
              email : "ajaup@gmail.com"
            }
          ],
          faculty : {
            email : "instaeapp@gmail.com"
          } 
       }
       await db.Society.create(societyobj3);

       let societyobj4 = {
          name : "isa",
          title : "Greatest society of all time.",
          aboutsociety : "<p>ISA vesit</p>",
          chairperson : {
            email : "2018.ajay.gupta@ves.ac.in"
          },
          normal_members : [
            {
              email : "axj@gmail.com"
            }
          ],
          council_members : [
            {
              email : "vsi@gmail.com"
            }
          ],
          council_heads : [
            {
              email : "ajassup@gmail.com"
            }
          ],
          faculty : {
            email : "instaeasspp@gmail.com"
          } 
       }

       await db.Society.create(societyobj4);

        return res.json({
           message : "Society inserion is successful"
        });

    }catch(err){
      return next({
        messgae : "Society insertion was unsuccessful."
      });
    }
  });


router.get("/api/user/:userid/fetch/societydeails" , loginRequired , ensureCorrectUser , async function(req , res , next) {
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


router.get("/api/user/:userid/getallusers" , loginRequired , ensureCorrectUser , async function(req , res , next){
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


// router.post("/api/user/:userid/create/personaldetails" , loginRequired , ensureCorrectUser , upload.single('image') , async function(req , res , next){
//       try{
//         const { firstname , lastname , phonenum } = req.body;
//         let imgobj = await fileUpload(req.file);
        
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

router.get("/api/user/:userid/get/updateddataandtoken" , loginRequired , ensureCorrectUser , async function(req , res , next){
    try{

      let user = await db.User.findById(req.params.userid);
      let populateduser = await db.User.findById(req.params.userid).populate({
          path : "registered_events" ,
          populate : { path : "guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers sponsors" ,
          populate : { path : "typeuser typeguest typeeventtaker" } }
      }).exec();

      if(user){ 
        let userdata = {
           role : user.role ? user.role : null, 
           username : user.username,
           firstname : user.firstname,
           lastname : user.lastname,
           imgurl : user.imgurl,
           _id : user._id,
           email : user.email,
           classdetails : {
               department : user.classdetails.department,
               class : user.classdetails.class,
               rollno : user.classdetails.rollno,
               currentyearofstudy : user.classdetails.currentyearofstudy,
               semester : user.classdetails.semester
           },
           societydetails : {
               name : user.societydetails.name,
               role : user.societydetails.role,
               specificrole : user.societydetails.specificrole
           },
           registered_events : user.registered_events ? user.registered_events : []
        }
           
        let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
        console.log(token);
        return res.json({ 
            token,
            userdetails : userdata,
            registeredevents : populateduser.registered_events ? populateduser.registered_events : []
       });   
     }else{
       return next({
         message : "User not found."
       });
     }

    }catch(err){
      console.log(err);
      return next(err);
    }
})


router.post("/api/user/:userid/create/classandsociety" , loginRequired , ensureCorrectUser , async function(req , res , next){
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
          role : user.role, 
          username : user.username,
          firstname : user.firstname,
          lastname : user.lastname,
          imgurl : user.imgurl,
          _id : user._id,
          email : user.email,
          classdetails : {
              department : user.classdetails.department,
              class : user.classdetails.class,
              rollno : user.classdetails.rollno,
              currentyearofstudy : user.classdetails.currentyearofstudy,
              semester : user.classdetails.semester
          },
          societydetails : {
              name : user.societydetails.name,
              role : user.societydetails.role,
              specificrole : user.societydetails.specificrole              
          },
          registered_events : user.registered_events ? user.registered_events : []
      }

      let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
      return res.json({
        token,
        userdetails : userdata
      });

    }catch(err){
      console.log(err);
        return next({
              message : err.message
        });
    }
});


router.post("/api/user/:userid/add/eventdetails" ,  loginRequired , ensureCorrectUser , upload.single('image') , async function(req , res , next){
    try{
        
      let user = await db.User.findById(req.params.userid);
      // Add user admin verification
      if(user){
          let imgobj = await fileUpload(req.file);
          let dbsociety = await db.Society.findOne({name : user.societydetails.name});
          let event = {
            name : req.body.eventname,
            date : req.body.date,
            time : req.body.time,
            category : req.body.category,
            imgurl : imgobj,
            shortdesc : req.body.shortdesc,
            fulldesc : req.body.fulldesc,
            creator : user._id,
            society : dbsociety._id
          } 

          let dbevent = await db.Event.create(event);
          dbevent.creator = user._id;
          await dbevent.save();
          
          dbsociety.events.push(dbevent._id);
          await dbsociety.save();
          
          return res.json({
             eventdetails : dbevent
          });

      }else{
        return next({
          message : "User not found"
        });
      }
         
    }catch(err){
      return next(err);
    }
});


router.get("/api/user/:userid/addevent/:eventid/getallguestsandsponsorsandeventtakers" , loginRequired , ensureCorrectUser , async function(req , res , next){
  try{  
      // check for user admin ==>
      let selectedguests = [];
      let selectedeventtakers = [];
      let addedguests = [];
      let addedeventtakers = [];
      let addedsponsors = [];

      let populatedevent = await db.Event.findById(req.params.eventid).populate({
        path : "guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers sponsors", 
        populate : { path : "typeuser typeguest typeeventtaker" }
      }).exec();
      if(populatedevent){
        // Send one main object
          
          // For selected guests =====>
          if(populatedevent.guests.registered_guests.typeuser && populatedevent.guests.registered_guests.typeuser.length > 0){
            let allusers = populatedevent.guests.registered_guests.typeuser.map(user => {
                let newuser = {};
                newuser.roletype = "user";
                newuser.data = user;
                return newuser;
            });
            selectedguests = selectedguests.concat(allusers);
          }
          if(populatedevent.guests.registered_guests.typeguest && populatedevent.guests.registered_guests.typeguest.length > 0){
              let allguests = populatedevent.guests.registered_guests.typeguest.map(guest => {
                  let newguest = {};
                  newguest.roletype = "guest";
                  newguest.data = guest;
                  return newguest; 
                  
              })
              selectedguests = selectedguests.concat(allguests);
          }
          if(populatedevent.guests.registered_guests.typeeventtaker && populatedevent.guests.registered_guests.typeeventtaker.length > 0){
            let alleventtakers = populatedevent.guests.registered_guests.typeeventtaker.map(eventtaker => {
                let neweventtaker = {};
                neweventtaker.data = eventtaker;
                neweventtaker.roletype = "eventtaker";
                return neweventtaker;
            });
            selectedguests = selectedguests.concat(alleventtakers);
          }

          // For selected eventtakers ===>
          if(populatedevent.eventtakers.registered_eventtakers.typeuser.length > 0){
            let allusers = populatedevent.eventtakers.registered_eventtakers.typeuser.map(user => {
              let newuser = {};
              newuser.roletype = "user";
              newuser.data = user;
              return newuser;
            });
            selectedeventtakers = selectedeventtakers.concat(allusers);
          }
          if(populatedevent.eventtakers.registered_eventtakers.typeguest.length > 0){
              let allguests = populatedevent.eventtakers.registered_eventtakers.typeguest.map(guest => {
                  let newguest = {};
                  newguest.roletype = "guest";
                  newguest.data = guest;
                  return newguest; 
              });
              selectedeventtakers = selectedeventtakers.concat(allguests);
          }
          if(populatedevent.eventtakers.registered_eventtakers.typeeventtaker.length > 0){
            let alleventakers = populatedevent.eventtakers.registered_eventtakers.typeeventtaker.map(eventtaker => {
                  let neweventtaker = {};
                  neweventtaker.data = eventtaker;
                  neweventtaker.roletype = "eventtaker";
                  return neweventtaker;
            });
            selectedeventtakers = selectedeventtakers.concat(alleventakers);
          }

          // For added guests , eventtakers , sponsors ===>
          if(populatedevent.guests.unregistered_guests.length > 0){
              let allunregisteredguests = populatedevent.guests.unregistered_guests.map(guest => {
                  let dataobj = {};
                  dataobj.roletype = "guest";
                  dataobj.data = guest;
                  return dataobj;
              });
              addedguests = addedguests.concat(allunregisteredguests);
          } 

          if(populatedevent.eventtakers.unregistered_eventtakers.length > 0){
                let allunregisteredeventtakers = populatedevent.eventtakers.unregistered_eventtakers.map(eventtaker => {
                    let dataobj = {};
                    dataobj.roletype = "eventtaker";
                    dataobj.data = eventtaker;
                    return dataobj;
                });
                addedeventtakers = addedeventtakers.concat(allunregisteredeventtakers);
          }

          addedsponsors = populatedevent.sponsors;
          
          return res.json({
              selectedguests,
              selectedeventtakers,
              addedguests,
              addedeventtakers,
              addedsponsors
          });
      }
      
      return next({
        message : "This event does not exist."
      });

  }catch(err){
      console.log(err);
      return next(err);
  }
    
  });

router.post("/api/user/:userid/addevent/:eventid/addselected/guestoreventaker" , loginRequired , ensureCorrectUser , async function(req , res , next){
     try{
        // find event 
        // find subpart (guest or eventtaker) from req.body
        // find user based on key
        // find user does not exist
          // add the user , eventtaker , guest in that array
        let { target , roletype , role , key } = req.body;
        let event = await db.Event.findById(req.params.eventid);
        if(target === "guest"){
            if(roletype === "user"){
                // We are adding guest and type of the user selected is user
                let user = await db.User.findById(key);
                isUserExist = false;
                event.guests.registered_guests.typeuser.forEach(user => {
                   if(user._id.toString() === key.toString()){
                       isUserExist = true;
                   }
                });
                if(!isUserExist){
                     event.guests.registered_guests.typeuser.push(user._id);
                     await event.save();
                }
            }else if(roletype === "guest"){
                // We are adding guest and type of the user selected is guest
                let guest = await db.Guest.findById(key);
                isGuestExist = false;
                event.guests.registered_guests.typeguest.forEach(guest => {
                  if(guest._id.toString() === key.toString()){
                      isUserExist = true;
                  }
               });
               if(!isGuestExist){
                    event.guests.registered_guests.typeguest.push(guest._id);
                    await event.save();
               }
            }else{
              // We are adding guest and type of the user selected is eventtaker
              let eventtaker = await db.Eventtaker.findById(key);
                isEventtakerExist = false;
                event.guests.registered_guests.typeeventtaker.forEach(eventtaker => {
                  if(eventtaker._id.toString() === key.toString()){
                    isEventtakerExist = true;
                  }
               });
               if(!isEventtakerExist){
                    event.guests.registered_guests.typeeventtaker.push(eventtaker._id);
                    await event.save();
               }
            }
        }
        if(target === "eventtaker"){
          // Selected session is for Eventakers 
            if(roletype === "user"){
              // We are adding guest and type of the user selected is user
              let user = await db.User.findById(key);
              isUserExist = false;
              event.eventtakers.registered_eventtakers.typeuser.forEach(user => {
                if(user._id.toString() === key.toString()){
                    isUserExist = true;
                }
              });
              if(!isUserExist){
                  event.eventtakers.registered_eventtakers.typeuser.push(user._id);
                  await event.save();
              }
            }else if(roletype === "guest"){
                // We are adding guest and type of the user selected is guest
                let guest = await db.Guest.findById(key);
                isGuestExist = false;
                event.eventtakers.registered_eventtakers.typeguest.forEach(guest => {
                  if(guest._id.toString() === key.toString()){
                      isUserExist = true;
                  }
              });
              if(!isGuestExist){
                    event.eventtakers.registered_eventtakers.typeguest.push(guest._id);
                    await event.save();
              }
            }else{
              // We are adding guest and type of the user selected is eventtaker
              let eventtaker = await db.Eventtaker.findById(key);
                isEventtakerExist = false;
                event.eventtakers.registered_eventtakers.typeeventtaker.forEach(eventtaker => {
                  if(eventtaker._id.toString() === key.toString()){
                      isEventtakerExist = true;
                  }
              });
              if(!isEventtakerExist){
                    event.eventtakers.registered_eventtakers.typeeventtaker.push(eventtaker._id);
                    await event.save();
              }
            }
        }
         
        let populatedevent = await db.Event.findById(req.params.eventid).populate({
           path : "guests.registered_guests eventtakers.registered_eventtakers" , populate : { path : "typeuser typeguest typeeventtaker" }
        }).exec();

        let selectedpersons = []; 

        if(target === "guest"){
          if(populatedevent.guests.registered_guests.typeuser && populatedevent.guests.registered_guests.typeuser.length > 0){
              let allusers = populatedevent.guests.registered_guests.typeuser.map(user => {
                  let newuser = {};
                  newuser.roletype = "user";
                  newuser.data = user;
                  return newuser;
              });
              selectedpersons = selectedpersons.concat(allusers);
          }
          if(populatedevent.guests.registered_guests.typeguest && populatedevent.guests.registered_guests.typeguest.length > 0){
              let allguests = populatedevent.guests.registered_guests.typeguest.map(guest => {
                  let newguest = {};
                  newguest.roletype = "guest";
                  newguest.data = guest;
                  return newguest; 
                  
              })
              selectedpersons = selectedpersons.concat(allguests);
          }
          if(populatedevent.guests.registered_guests.typeeventtaker && populatedevent.guests.registered_guests.typeeventtaker.length > 0){
             let alleventtakers = populatedevent.guests.registered_guests.typeeventtaker.map(eventtaker => {
                let neweventtaker = {};
                neweventtaker.data = eventtaker;
                neweventtaker.roletype = "eventtaker";
                return neweventtaker;
             });
             selectedpersons = selectedpersons.concat(alleventtakers);
          }
        }
        if(target === "eventtaker"){
            if(populatedevent.eventtakers.registered_eventtakers.typeuser.length > 0){
                let allusers = populatedevent.eventtakers.registered_eventtakers.typeuser.map(user => {
                  let newuser = {};
                  newuser.roletype = "user";
                  newuser.data = user;
                  return newuser;
                });
                selectedpersons = selectedpersons.concat(allusers);
            }
            if(populatedevent.eventtakers.registered_eventtakers.typeguest.length > 0){
                let allguests = populatedevent.eventtakers.registered_eventtakers.typeguest.map(guest => {
                    let newguest = {};
                    newguest.roletype = "guest";
                    newguest.data = guest;
                    return newguest; 
                });
                selectedpersons = selectedpersons.concat(allguests);
            }
            if(populatedevent.eventtakers.registered_eventtakers.typeeventtaker.length > 0){
               let alleventakers = populatedevent.eventtakers.registered_eventtakers.typeeventtaker.map(eventtaker => {
                    let neweventtaker = {};
                    neweventtaker.data = eventtaker;
                    neweventtaker.roletype = "eventtaker";
                    return neweventtaker;
               });
               selectedpersons = selectedpersons.concat(alleventakers);
            }
        }

        return res.json({
          target :  target,
          selectedpersons :  selectedpersons 
        });

     }catch(err){
       console.log(err.message);
        return next(err);
     }
});



router.delete("/api/user/:userid/addevent/:eventid/remove/selected/:target/:roletype/:role/:key" , loginRequired , ensureCorrectUser , async function(req , res , next){
   try{
      let event = await db.Event.findById(req.params.eventid);
      if(req.params.target === "guest"){
           if(req.params.roletype === "user"){
               let index;
               for(let i = 0 ; i < event.guests.registered_guests.typeuser.length ; i++){
                  if(req.params.key.toString() === event.guests.registered_guests.typeuser[i].toString()){
                     index = i;
                     break;
                  }
               }
               event.guests.registered_guests.typeuser.splice(index , 1);
               await event.save();
           }

           if(req.params.roletype === "guest"){
              let index;
              for(let i = 0 ; i < event.guests.registered_guests.typeguest.length ; i++){
                  if(req.params.key.toString() === event.guests.registered_guests.typeguest[i].toString()){
                      index = i;
                      break;
                  }
              }
              event.guests.registered_guests.typeguest.splice(index , 1);
              await event.save();
           }

           if(req.params.roletype === "eventtaker"){
              let index;
              for(let i = 0 ; i < event.guests.registered_guests.typeeventtaker.length ; i++){
                if(req.params.key.toString() === event.guests.registered_guests.typeeventtaker[i].toString()){
                    index = i;
                    break;
                }
              }
              event.guests.registered_guests.typeeventtaker.splice(index , 1);
              await event.save();
          }
      }

      if(req.params.target === "eventtaker"){
            if(req.params.roletype === "user"){
                let index;
                for(let i = 0 ; i < event.eventtakers.registered_eventtakers.typeuser.length ; i++){
                  if(req.params.key.toString() === event.eventtakers.registered_eventtakers.typeuser[i].toString()){
                      index = i;
                      break;
                  }
                }
                event.eventtakers.registered_eventtakers.typeuser.splice(index , 1);
                await event.save();
            }

            if(req.params.roletype === "guest"){
                let index;
                for(let i = 0 ; i < event.eventtakers.registered_eventtakers.typeguest.length ; i++){
                    if(req.params.key.toString() === event.eventtakers.registered_eventtakers.typeguest[i].toString()){
                        index = i;
                        break;
                    }
                }
                event.eventtakers.registered_eventtakers.typeguest.splice(index , 1);
                await event.save();
            }

            if(req.params.roletype === "eventtaker"){
                let index;
                for(let i = 0 ; i < event.eventtakers.registered_eventtakers.typeeventtaker.length ; i++){
                  if(req.params.key.toString() === event.eventtakers.registered_eventtakers.typeeventtaker[i].toString()){
                      index = i;
                      break;
                  }
                }
                event.eventtakers.registered_eventtakers.typeeventtaker.splice(index , 1);
                await event.save();
            }
      }

      let populatedevent = await db.Event.findById(req.params.eventid).populate({
        path : "guests.registered_guests eventtakers.registered_eventtakers" , populate : { path : "typeuser typeguest typeeventtaker" }
     }).exec();
    
     let selectedpersons = []; 

     if(req.params.target === "guest"){
       if(populatedevent.guests.registered_guests.typeuser && populatedevent.guests.registered_guests.typeuser.length > 0){
           let allusers = populatedevent.guests.registered_guests.typeuser.map(user => {
               let newuser = {};
               newuser.roletype = "user";
               newuser.data = user;
               return newuser;
           });
           selectedpersons = selectedpersons.concat(allusers);
       }
       if(populatedevent.guests.registered_guests.typeguest && populatedevent.guests.registered_guests.typeguest.length > 0){
           let allguests = populatedevent.guests.registered_guests.typeguest.map(guest => {
               let newguest = {};
               newguest.roletype = "guest";
               newguest.data = guest;
               return newguest; 
               
           })
           selectedpersons = selectedpersons.concat(allguests);
       }
       if(populatedevent.guests.registered_guests.typeeventtaker && populatedevent.guests.registered_guests.typeeventtaker.length > 0){
          let alleventtakers = populatedevent.guests.registered_guests.typeeventtaker.map(eventtaker => {
             let neweventtaker = {};
             neweventtaker.data = eventtaker;
             neweventtaker.roletype = "eventtaker";
             return neweventtaker;
          });
          selectedpersons = selectedpersons.concat(alleventtakers);
       }
     }
     if(req.params.target === "eventtaker"){
         if(populatedevent.eventtakers.registered_eventtakers.typeuser.length > 0){
             let allusers = populatedevent.eventtakers.registered_eventtakers.typeuser.map(user => {
               let newuser = {};
               newuser.roletype = "user";
               newuser.data = user;
               return newuser;
             });
             selectedpersons = selectedpersons.concat(allusers);
         }
         if(populatedevent.eventtakers.registered_eventtakers.typeguest.length > 0){
             let allguests = populatedevent.eventtakers.registered_eventtakers.typeguest.map(guest => {
                 let newguest = {};
                 newguest.roletype = "guest";
                 newguest.data = guest;
                 return newguest; 
             });
             selectedpersons = selectedpersons.concat(allguests);
         }
         if(populatedevent.eventtakers.registered_eventtakers.typeeventtaker.length > 0){
            let alleventakers = populatedevent.eventtakers.registered_eventtakers.typeeventtaker.map(eventtaker => {
                 let neweventtaker = {};
                 neweventtaker.data = eventtaker;
                 neweventtaker.roletype = "eventtaker";
                 return neweventtaker;
            });
            selectedpersons = selectedpersons.concat(alleventakers);
         }
     }

     return res.json({
       target :  req.params.target,
       selectedpersons :  selectedpersons 
     });
      
   }catch(err){
     console.log(err.message);
   }
});

// Adding guest who does not exist on our portal
router.post("/api/user/:userid/addevent/:eventid/addperson/guestoreventakerorsponsor" , loginRequired ,ensureCorrectUser , async function(req, res , next){
     try{
         
        // Three type of data insertion (guest , eventtaker , sponsor) ====>
        // target == guest
           // roletype == guest
           // three types outsideperson , faculty , others
           // // based on that insert created guest
        let event = await db.Event.findById(req.params.eventid);
        let dataobj = {};
        dataobj.role = req.body.role;
        if(req.body.role === "outsideperson" || req.body.role === "faculty"){
            dataobj.details = {
              [req.body.role] : {
                name : req.body.name,
                profession : req.body.profession
              }
            }
        }
        if(req.body.role === "others"){
            dataobj.details = {
              [req.body.role] : {
                name : req.body.name,
                class : req.body.class,
                branch : req.body.branch,
                currentyear : req.body.currentyear
              }
            }
        }
        console.log(dataobj);
        if(req.body.target === "guest"){
           if(req.body.roletype === "guest"){
              let createdguest = await db.Guest.create(dataobj);
              createdguest.inevent.push(event._id);
              await createdguest.save();
              event.guests.unregistered_guests.push(createdguest._id);
              await event.save();
           }
        }
        if(req.body.target === "eventtaker"){
           if(req.body.roletype === "eventtaker"){
              let createdeventtaker = await db.Eventtaker.create(dataobj);
              createdeventtaker.inevent.push(event._id);
              await createdeventtaker.save();
              event.eventtakers.unregistered_eventtakers.push(createdeventtaker._id);
              await event.save();
           }
        }

        let populatedevent = await db.Event.findById(req.params.eventid).populate({
          path : "guests.unregistered_guests eventtakers.unregistered_eventtakers"
       }).exec();
      
       let addedpersons = []; 
  
       if(req.body.target === "guest"){
         console.log("Loopin data ===>" , populatedevent.guests.unregistered_guests);
            let addedguests = populatedevent.guests.unregistered_guests.map(guest => {
                let dataobj = {};
                dataobj.roletype = "guest";
                dataobj.data = guest;
                return dataobj;
            });
            addedpersons = addedpersons.concat(addedguests);
       }
       if(req.body.target === "eventtaker"){
           let addedeventtakers = populatedevent.eventtakers.unregistered_eventtakers.map(eventtaker => {
                let dataobj = {};
                dataobj.roletype = "eventtaker";
                dataobj.data = eventtaker;
                return dataobj;
           });
           addedpersons = addedpersons.concat(addedeventtakers);
       }
      
       return res.json({
         target :  req.body.target,
         addedpersons :  addedpersons 
       });


     }catch(err){
        console.log(err);
        return next(err);

     }
});


router.delete("/api/user/:userid/addevent/:eventid/remove/added/:target/:roletype/:role/:key" , loginRequired , ensureCorrectUser, async function(req , res , next){
     try{
         
        // Take action based on target ====>
           // guest 
             // remove guest from array of events
           // eventtaker 
            // remove eventtaker from the array of event
        // then send data
        let event = await db.Event.findById(req.params.eventid);
        if(req.params.target === "guest"){
            if(req.params.roletype === "guest"){
                let index;
                for(let i = 0 ; i < event.guests.unregistered_guests.length ; i++){
                    if(req.params.key.toString() === event.guests.unregistered_guests[i].toString()){
                        index = i;
                        break;
                    }
                }
                event.guests.unregistered_guests.splice(index , 1);
                await event.save();
            }
        }
        
        if(req.params.target === "eventtaker"){
          if(req.params.roletype === "eventtaker"){
              let index;
              for(let i = 0 ; i < event.eventtakers.unregistered_eventtakers.length ; i++){
                  if(req.params.key.toString() === event.eventtakers.unregistered_eventtakers[i].toString()){
                      index = i;
                      break;
                  }
              }
              event.eventtakers.unregistered_eventtakers.splice(index , 1);
              await event.save();
              
          }
        }
        
        let populatedevent = await db.Event.findById(req.params.eventid).populate({
          path : "guests.unregistered_guests eventtakers.unregistered_eventtakers"
        }).exec();

        if(req.params.target === "guest"){
          if(req.params.roletype === "guest"){
              return res.json({
                target : "guest",
                removedpersons : populatedevent.guests.unregistered_guests
              });
          }
        }

        if(req.params.target === "eventtaker"){
          if(req.params.roletype === "eventtaker"){
              return res.json({
                target : "eventtaker",
                removedpersons : populatedevent.eventtakers.unregistered_eventtakers
              });
          }
        }

     }catch(err){
       console.log(err);
       return next(err);
     }
});

router.post("/api/user/:userid/addevent/:eventid/addsponsor/sponsor" , loginRequired , ensureCorrectUser , upload.single('image') , async function(req , res , next){
    
    try{
        let imgdata = {};
        if(req.file){
            imgdata = await fileUpload(req.file);
        }
      
        let sponsorobj = {
          name : req.body.name,
          description : req.body.details,
          imgurl : imgdata
        }
        
        let event = await db.Event.findById(req.params.eventid);
        if(event){
            if(req.body.target === "sponsor"){
                let sponsor = await db.Sponsor.create(sponsorobj);
                sponsor.inevent.push(event._id);
                await sponsor.save();
                event.sponsors.push(sponsor._id);
                await event.save();
            }
        }

        let populatedevent = await db.Event.findById(req.params.eventid).populate("sponsors").exec();
        return res.json({
          target : "sponsor",
          sponsors : populatedevent.sponsors
        });

    }catch(err){
      console.log(err);
      return next(err);
    }
    
});

router.delete("/api/user/:userid/addevent/:eventid/remove/sponsor/:target/:key" , loginRequired  , ensureCorrectUser, async function(req , res , next){
   try{ 
       if(req.params.target === "sponsor"){
           let event = await db.Event.findById(req.params.eventid);
           let index;
           for(let i = 0 ; i < event.sponsors.length ; i++){
            if(req.params.key.toString() === event.sponsors[i].toString()){
                  index = i;
                  break;
            }
          }
          event.sponsors.splice(index , 1);
          await event.save();

          let populatedevent = await db.Event.findById(req.params.eventid).populate("sponsors").exec();
          console.log(populatedevent);
          return res.json({
            target : "sponsor",
            sponsors : populatedevent.sponsors
          });
       }
   }catch(err){
       console.log(err);
       return next(err);
   }
});


router.post("/api/user/:userid/addevent/:eventid/add/registrationlink" , loginRequired , ensureCorrectUser, async function(req , res){
    try{
      
       let event = await db.Event.findById(req.params.eventid);
       if(event){
            if(req.body.haveregistrationform === "true"){
              if(req.body.formlink !== ""){
                event.registrationformlink.haveregistrationform = true;
                event.registrationformlink.formlink = req.body.formlink;
                await event.save();

                return res.json({
                  eventdetails : event
                })

              }else{
                  return next({
                    message : "It seems that you have registration form link but you have send nothing."
                  });
              }
          }else{
              event.registrationformlink.haveregistrationform = false;
              event.registrationformlink.formlink = req.body.formlink;
              await event.save();

              return res.json({
                eventdetails : event
              })
          }
       }else{
          return next({
            message : "Event does not exist."
          });
       }
       
    }catch(err){
       console.log(err);
       return next(err);
    }
});


router.get("/api/user/:userid/event/:eventid/createdeventsdetails" , loginRequired , ensureCorrectUser , async function(req , res){
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


// User profile update =======>
   //  personaldetails  =======

router.post("/api/user/:userid/edit/profile/personaldetails" , loginRequired , ensureCorrectUser , upload.single("image") , async function(req ,res , next){
   try{
      
      let user = await db.User.findById(req.params.userid);
      if(user){
              let imgobj = {};
              console.log("File found" , req.file);
              if(req.file){
                  imgobj = await fileUpload(req.file);
              }
              user.firstname = req.body.firstname;
              user.lastname = req.body.lastname;
              user.username = req.body.firstname + "  " + req.body.lastname;
              if(req.file){
                user.imgurl = imgobj;
              }
              await user.save();

              let userdata = {
                role : user.role,
                username : user.username,
                firstname : user.firstname,
                lastname : user.lastname,
                imgurl : user.imgurl,
                _id : user._id,
                email : user.email,
                classdetails : {
                    department : user.classdetails.department,
                    class : user.classdetails.class,
                    rollno : user.classdetails.rollno,
                    currentyearofstudy : user.classdetails.currentyearofstudy,
                    semester : user.classdetails.semester
                },
                societydetails : {
                    name : user.societydetails.name,
                    role : user.societydetails.role,
                    specificrole : user.societydetails.specificrole
                },
                registered_events : user.registered_events ? user.registered_events : []
            }
                
            let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
            return res.json({ 
                token,
                userdetails : userdata
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


router.post("/api/user/:userid/edit/profile/societydetails" , loginRequired , ensureCorrectUser , async function(req ,res , next){
  try{
     
     let user = await db.User.findById(req.params.userid);
    
     if(user){
              if(req.body.role === "student"){
                if(user.societydetails.role !== "faculty"){
                      user.societydetails.specificrole = req.body.specificrole;
                      await user.save();

                      let userdata = {
                        role : user.role,
                        username : user.username,
                        firstname : user.firstname,
                        lastname : user.lastname,
                        imgurl : user.imgurl,
                        _id : user._id,
                        email : user.email,
                        classdetails : {
                            department : user.classdetails.department,
                            class : user.classdetails.class,
                            rollno : user.classdetails.rollno,
                            currentyearofstudy : user.classdetails.currentyearofstudy,
                            semester : user.classdetails.semester
                        },
                        societydetails : {
                            name : user.societydetails.name,
                            role : user.societydetails.role,
                            specificrole : user.societydetails.specificrole
                        },
                        registered_events : user.registered_events ? user.registered_events : []
                    }

                    let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
                    return res.json({ 
                        token,
                        userdetails : userdata
                    }); 
                }else{
                  return next({
                    message : "Doing Something wrong."
                  })
                }
              }else{

                 return next({
                   message : "You are not allowed to do this action."
                 })

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

router.post("/api/user/:userid/edit/profile/classdetails" , loginRequired , ensureCorrectUser , async function(req ,res , next){
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
                role : user.role,
                username : user.username,
                firstname : user.firstname,
                lastname : user.lastname,
                imgurl : user.imgurl,
                _id : user._id,
                email : user.email,
                classdetails : {
                    department : user.classdetails.department,
                    class : user.classdetails.class,
                    rollno : user.classdetails.rollno,
                    currentyearofstudy : user.classdetails.currentyearofstudy,
                    semester : user.classdetails.semester
                },
                societydetails : {
                    name : user.societydetails.name,
                    role : user.societydetails.role,
                    specificrole : user.societydetails.specificrole
                },
                registered_events:  user.registered_events ? user.registered_events : null
            }

            let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
            return res.json({ 
                token,
                userdetails : userdata
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

// Society related stuff ====>
router.post("/api/society/:societyname/edit/societydetails/editor/:userid" , loginRequired , ensureCorrectUser , upload.fields([ {name : "societyimage" }, {name : "societybackground"} ]) ,  async function(req , res , next){
  try{
      
      // Permission to Edit council head and faculty and chairperson
      let societyimage = {};
      let societybackground = {};
      for(let i = 0 ; i < 2 ; i++){
          if(i === 0){
            if(Object.keys(req.files).length > 0){
              if(req.files['societyimage']){
                  societyimage = await fileUpload(req.files['societyimage'][0]);
              }
            }
          }

          if(i === 1){
            if(Object.keys(req.files).length > 0){
              if(req.files['societybackground']){
                societybackground = await fileUpload(req.files['societybackground'][0]);
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

router.post("/api/society/:societyname/edit/aboutsociety/editor/:userid" , loginRequired , ensureCorrectUser ,  async function(req , res , next){
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

router.post("/api/user/download/file" , async function(req , res , next){
    try{
      req.headers.authorization = `Bearer ${req.body.token}`;
      // const fileStream = fs.createReadStream("../ajay.txt");
      // const compressionStream = brotli();
      // fileStream.pipe(compressionStream);
      const file = fs.createWriteStream("./diskdata/ajay.txt");
      const data = http.get(`http://www.googleapis.com/drive/v2/files/${req.body.data.id}?alt=media`, function(response) {
         response.pipe(file);
         console.log(file);
      });
      

      // let data = await download(`http://www.googleapis.com/drive/v2/files/${req.body.data.id}`);
      // fs.writeFileSync("data/ajay.text" , data);

    }catch(err){
      console.log(err);
    }
});


router.post("/api/society/:societyname/edit/facultyorchairperson/editor/:userid" , loginRequired , ensureCorrectUser , async function(req , res , next){
    
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
 

const fileUpload = async (file) => {
     let imgobj = {};
      if(file){
              if(file.size > 1000000){
                  let buffdata;
                  let dimensions = sizeOf(file.path);
                  await sharp(file.path)
                  .resize({
                      width: Math.floor(dimensions.width*0.5),
                      height: Math.floor(dimensions.height*0.5),
                      fit: sharp.fit.cover,
                      position: sharp.strategy.entropy
                  })
                  .withMetadata()
                  .toFormat("jpeg")
                  .jpeg({ quality: 95 })
                  .toBuffer({ resolveWithObject: true })
                  .then(({ data, info }) => { 
                      buffdata = data;
                   })
                  .catch(err => {
                      console.error(err.message);
                      return next({
                          message : err.message
                      });
                  });

                  var result = await uploadFromBuffer(buffdata);
              }else{
                  var result = await upload_get_url(file.path);
              }
              var angle = getAngle(result.exif.Orientation);
              imgobj.dataurl = result.secure_url;
              imgobj.dataid = result.public_id;
              imgobj.angle =  angle;
      }
      return imgobj;
}



// UPLOAD IMAGE TO CLOUDINARY.COM SENDING OBJECT..
function upload_get_url(image){
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(image , {exif : true} , (err, url) => {
        if (err) return reject(err);
        return resolve(url);
      });
    });
  }
  
  
  // Upload buffer image to cloudinary 
  let uploadFromBuffer = (req) => {
     return new Promise((resolve, reject) => {
       let cld_upload_stream = cloudinary.v2.uploader.upload_stream({exif : true},
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
           }
         }
       );
       streamifier.createReadStream(req).pipe(cld_upload_stream);
     });
  };

// GETTING ANGLE OF IMAGE(ORIENTATION OF IMAGE)
const getAngle = (number) => {
	switch(number){
		case "1" :
			return(0);
			
		case "8" :
			return(270);
			
		case "3" :
			return(180);
			
		case "6" :
			return(90);
	}	
}



module.exports = router;