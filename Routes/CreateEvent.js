const express  =  require("express");
const router   =  express.Router();
const db       =  require("../models");
const { loginRequired , ensureCorrectUser }  = require("../middleware/auth");
const imageUpload = require("../handlers/ImageUpload");



// Create event - Event details (step 1)
router.post("/user/:userid/add/eventdetails" ,  loginRequired , ensureCorrectUser , imageUpload.upload.single('image') , async function(req , res , next){
    try{
        
      let user = await db.User.findById(req.params.userid);
      // Add user admin verification
      if(user){
          let imgobj = await imageUpload.fileUpload(req.file);
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


// Getting all Guests, Sponsors, Eventtakers 
router.get("/user/:userid/addevent/:eventid/getallguestsandsponsorsandeventtakers" , loginRequired , ensureCorrectUser , async function(req , res , next){
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


// Add Guest and Eventtakers from list == Create Event Guest , Eventtakers, Sponsors ( Step 2 )
router.post("/user/:userid/addevent/:eventid/addselected/guestoreventaker" , loginRequired , ensureCorrectUser , async function(req , res , next){
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


// Remove Guest and Eventtakers from selected list == Create Event Guest , Eventtakers, Sponsors ( Step 2 )
router.delete("/user/:userid/addevent/:eventid/remove/selected/:target/:roletype/:role/:key" , loginRequired , ensureCorrectUser , async function(req , res , next){
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



// Create new Guest == Create Event Guest , Eventtakers, Sponsors ( Step 2 )
router.post("/user/:userid/addevent/:eventid/addperson/guestoreventakerorsponsor" , loginRequired ,ensureCorrectUser , async function(req, res , next){
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


// Remove Guest and Eventtakers from created list == Create Event Guest , Eventtakers, Sponsors ( Step 2 )
router.delete("/user/:userid/addevent/:eventid/remove/added/:target/:roletype/:role/:key" , loginRequired , ensureCorrectUser, async function(req , res , next){
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


// Add new Sponsors == Create Event Guest , Eventtakers, Sponsors ( Step 2 )
router.post("/user/:userid/addevent/:eventid/addsponsor/sponsor" , loginRequired , ensureCorrectUser , imageUpload.upload.single('image') , async function(req , res , next){
    
    try{
        let imgdata = {};
        if(req.file){
            imgdata = await imageUpload.fileUpload(req.file);
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


// Remove Sponsors from created list == Create Event Guest , Eventtakers, Sponsors ( Step 2 )
router.delete("/user/:userid/addevent/:eventid/remove/sponsor/:target/:key" , loginRequired  , ensureCorrectUser, async function(req , res , next){
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


// Add registration link == Create Event , Registration link ( Step 3 ) 
router.post("/user/:userid/addevent/:eventid/add/registrationlink" , loginRequired , ensureCorrectUser, async function(req , res){
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






module.exports = router;