const express = require('express');
const router =  express.Router();
const db = require("../models");
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



// Login and signup routes 
router.post("/loginOrSignUp/google" , async function(req , res , next){
    try{
        // Take token of user's Google account  
        const { tokenId } = req.body;
        let resdata = await client.verifyIdToken({
            idToken : tokenId,
            audience : process.env.GOOGLE_CLIENT_ID
        });
        const { email_verified , name , email } = resdata.payload;

        // If Email is verified 
        if(email_verified){

            let user = await db.User.findOne({ email });
            // let fulluserdata = await db.User.findOne({ email }).populate({
            //       path : "registered_events",
            //       populate : { path : "guests.registered_guests eventtakers.registered_eventtakers guests.unregistered_guests eventtakers.unregistered_eventtakers sponsors" ,
            //       populate : { path : "typeuser typeguest typeeventtaker" } }
            // }).exec();

            // Login process ==
            if(user){ 
               let userdata = {
                  id : user._id
               }
                  
               let token = jwt.sign(userdata, process.env.JWT_SECRET_TOKEN);
               
               return res.json({ 
                   token,
                   userdetails : user,
                   registeredevents : user.registered_events ? user.registered_events : []
               });   
            }

            // Sign up process == 
            let firstname, lastname;
            let namearr = name.split(" ");
            if(namearr.length == 1){
                firstname = namearr[0];
            }else{
                firstname = namearr[0];
                lastname = namearr[1];
            }

            let newuser = await db.User.create({
                firstname,
                lastname,
                username : name,
                email : email,
            });
            
            let userdata = {
                id : newuser._id
            }

            let token = jwt.sign( userdata , process.env.JWT_SECRET_TOKEN );      
            return res.json({
                userdetails : newuser,
                token,
                registeredevents : []
            });

        }else{

            return next({
                messsage : "Please verify your email address. Then try to login."
            });
        }
  }catch(err){
      console.log(err);
      return next(err);
  }
});





module.exports = router;