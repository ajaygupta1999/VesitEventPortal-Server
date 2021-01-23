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
        let allsocietys = ["ieee" , "csi" , "iste", "isa"];
        for(let i = 0 ; i < allsocietys.length ; i++){
           await db.Society.create({
             name : allsocietys[i]
           });
        }

        return res.json({
           message : "Society inserion is successful"
        });

    }catch(err){
      return next({
        messgae : "Society insertion was unsuccessful."
      });
    }
  });



router.get("/api/user/:id/getallusers" , loginRequired , ensureCorrectUser , async function(req , res , next){
   try{
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


router.post("/api/user/:id/create/personaldetails" , loginRequired , ensureCorrectUser , upload.single('image') , async function(req , res , next){
      try{
        const { firstname , lastname , phonenum } = req.body;
        let imgobj = await fileUpload(req.file);
        
        let user = await db.User.findById(req.params.id);
        user.username = firstname + " " + lastname,
        user.firstname = firstname;
        user.lastname = lastname;
        user.phonenum = phonenum;
        user.imgurl = imgobj;
        await user.save();
        console.log(user);

        let userdata = {
            username : user.username,
            firstname : user.firstname,
            lastname : user.lastname,
            imgurl : user.imgurl,
            id : user._id,
            email : user.email,
        }

        let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
        return res.json({...userdata , token});

      }catch(err){
          return next({
                message : err.message
          });
      }
});


router.post("/api/user/:id/create/classandsociety" , loginRequired , ensureCorrectUser , async function(req , res , next){
    try{
      const { department, currentyear, rollno, semester, society, role  } = req.body;
      let user = await db.User.findById(req.params.id);
      user.classdetails = {
        department : department,
        class : req.body.class,
        rollno : rollno,
        currentyearofstudy : currentyear,
        semester : semester
      } 

      user.societydetails = {
          name : society,
          role : role
      }
      await user.save();

      // Setting up society details
      let dbsociety = await db.Society.findOne({name : society});
      console.log(dbsociety);
      if(role === "normal-member"){
          dbsociety.normal_member.push(user._id);
          await dbsociety.save();
      }
      if(role === "council-member"){
          dbsociety.council_members.push(user._id);
          await dbsociety.save();
      }
      if(role === "council-head"){
         dbsociety.council_head.push(user._id);
         await dbsociety.save();
      }

      console.log(dbsociety);
      let userdata = {
          username : user.username,
          firstname : user.firstname,
          lastname : user.lastname,
          imgurl : user.imgurl,
          id : user._id,
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
              role : user.societydetails.role
          }
      }

      let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
      return res.json({ ...userdata , token});

    }catch(err){
        return next({
              message : err.message
        });
    }
});


router.post("/api/user/:id/add/eventdetails" ,  loginRequired , ensureCorrectUser , upload.single('image') , async function(req , res , next){
    try{
      let imgobj = await fileUpload(req.file);  
      let user = await db.User.findById(req.params.id);
      let dbsociety = await db.Society.findOne({name : user.societydetails.name});
      console.log(req.body.fulldesc);
      if(user){
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
          
          return res.json({
              id : dbevent._id, 
              name : dbevent.name,
              date : dbevent.date,
              time : dbevent.time,
              category : dbevent.category,
              image : dbevent.imgurl,
              shortdesc : dbevent.shortdesc,
              fulldesc : dbevent.fulldesc,
          });
      }else{
        return next({
          message : "User Not found"
        });
      }
         
    }catch(err){
      return next(err);
    }
});


router.post("/api/user/:userid/addevent/:eventid/addselected/guestoreventaker" , loginRequired  , async function(req , res , next){
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



router.delete("/api/user/:userid/addevent/:eventid/remove/selected/:target/:roletype/:role/:key" , loginRequired , async function(req , res , next){
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
router.post("/api/user/:userid/addevent/:eventid/addperson/guestoreventakerorsponsor" , loginRequired , async function(req, res , next){
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


router.delete("/api/user/:userid/addevent/:eventid/remove/added/:target/:roletype/:role/:key" , loginRequired , async function(req , res , next){
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

router.post("/api/user/:userid/addevent/:eventid/addsponsor/sponsor" , loginRequired , upload.single('image') , async function(req , res , next){
    
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

router.delete("/api/user/:userid/addevent/:eventid/remove/sponsor/:target/:key" , loginRequired  , async function(req , res , next){
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