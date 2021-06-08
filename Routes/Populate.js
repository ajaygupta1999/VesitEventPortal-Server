const express = require("express");
const router = express.Router();
const db = require('../models');


// Populate guest data 
router.get("/guests" , async function(req , res , next){
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
         });

    }catch(err){
       return next({
         message : "got error while creating guest"
       });
    }
 });
 


 // Populate eventtakers === 
 router.get("/eventtakers" , async function(req , res , next){
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
 
 

 // Populate societies === 
 router.get("/societies" , async function(req , res , next){
     try{
         
        let societyobj1 = {
           name : "ieee",
           title : "Greatest society of all time.",
           aboutsociety : "<p>ISTE vesit</p>",
           chairperson : {
             name : "Sunita Shahu",
             email : "2018.ajay.gupta@ves.ac.in"
           },
           normal_members : [
             {
               name : "Ajay Gupta",
               email : "ajay.u.gupta14@gmail.com"
             }
           ],
           council_members : [
             {
                 name :  "Ajay G",
                 email : "vijaygupta14@gmail.com",
                 role : "council member",
                 specificrole : "Technical Team"
             }
           ],
           council_heads : [
             {
               name : "Vijay Gupta",
               email : "ajaygupta14@gmail.com"
             }
           ],
           faculty : {
             name : "Vijay G",
             email : "instapicwebsite@gmail.com"
           }  
        }
        await db.Society.create(societyobj1);
         
        let societyobj2 = {
           name : "csi",
           title : "Greatest society of all time.",
           aboutsociety : "<p>CSI vesit</p>",
           chairperson : {
             name : "Sunita Shahu",
             email : "2018.ajay.gupta@ves.ac.in"
           },
           normal_members : [
             {
               name : "Ajay Gupta",
               email : "ajay.u.gupta15@gmail.com"
             }
           ],
           council_members : [
             {
               name :  "Ajay G",
               email : "vijaygupta14@gmail.com",
               role : "council member",
               specificrole : "Technical Team"
             }
           ],
           council_heads : [
             {
               name : "Vijay Gupta",
               email : "ajaygupta15@gmail.com"
             }
           ],
           faculty : {
             name : "Vijay G",
             email : "instapicherokuweb14@gmail.com"
           }  
        }
        await db.Society.create(societyobj2);
 
        let societyobj3 = {
           name : "iste",
           title : "Greatest society of all time.",
           aboutsociety : "<p>ISTE vesit</p>",
           chairperson : {
             name : "Sunita Shahu",
             email : "2018.ajay.gupta@ves.ac.in"
           },
           normal_members : [
             {
               name : "Ajay Gupta",
               email : "ajay.u.gupta16@gmail.com"
             }
           ],
           council_members : [
             {
               name :  "Ajay G",
               email : "vijaygupta195@gmail.com",
               role : "council member",
               specificrole : "Technical Team"
             }
           ],
           council_heads : [
             {
               name : "Vijay Gupta",
               email : "2018.ajay.gupta@ves.ac.in"
             }
           ],
           faculty : {
             name : "Vijay G",
             email : "instapicwebsite@gmail.com"
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
               name : "Ajay",
               email : "axj@gmail.com"
             }
           ],
           council_members : [
             {
               name :  "Ajay G",
               email : "vi@gmail.com",
               role : "council member",
               specificrole : "Technical Team"
             }
           ],
           council_heads : [
             {
               name : "Ajay Gupta",
               email : "ajassup@gmail.com"
             }
           ],
           faculty : {
             name : "Ajay Gupta",
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



 router.get("/addcouncilheads/ieee" , async function(req , res ,next){
    try{
       let society = await db.Society.findOne({ name : "ieee" });
       let obj1 = {
         name : "Vijay gupta2",
         email : "vesiteventsportal@gmail.com"
       }

       let obj2 = {
         name : "Vijay5555",
         email : "vesitquerybot@gmail.com"
       }

       society.council_heads.push(obj1);
       society.council_heads.push(obj2);
       await society.save();

       return res.json("done");
    }catch(err){
      return next({
        message : err.message
      });
    }
 });










module.exports = router;