const db = require("../models");
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Signup function
const loginOrSignUp = async (req , res, next) => {
    try{
          let userdata;
          const { tokenId } = req.body;
          let resdata = await client.verifyIdToken({
              idToken : tokenId,
              audience : process.env.GOOGLE_CLIENT_ID
          });
          const { email_verified , name , picture , email} = resdata.payload;
          if(email_verified){
              let user = await await db.User.findOne({email});
              let fulluserdata = await db.User.findOne({email}).populate({
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
                     registeredevents : fulluserdata.registered_events ? fulluserdata.registered_events : []
                });   
              }
                // Create new user
                // Create jwt token 
                let firstname = "";
                let lastname = "";
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
                    _id : newuser._id,
                    username : newuser.username,
                    email : newuser.email,
                    firstname : newuser.firstname,
                    lastname : newuser.lastname,
                    imgurl : {},
                    registered_events : []
                }

                let token = jwt.sign(userdata , process.env.JWT_SECRET_TOKEN);      
                return res.json({
                    userdetails : userdata,
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
}



module.exports.loginOrSignUp = loginOrSignUp;
