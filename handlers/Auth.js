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
              let user = await db.User.findOne({email});
              if(user){ 
                
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

                 return res.json({ ...userdata , token });   
              }
                // Create new user
                // Create jwt token 
               let newuser = await db.User.create({
                    username : name,
                    email : email,
                });
                
                let userdata = {
                    id : newuser._id,
                    username : newuser.username,
                    email : newuser.email
                }

                let token = jwt.sign(userdata , process.env.JWT_SECRET_TOKEN);      
                return res.json({
                    ...userdata,
                    imgurl : {},
                    token
                });

           }else{
               return next({
                    messsage : "Please verify your email address. Then try to login."
               });
           }
    }catch(err){
        return next(err);
    }
}



module.exports.loginOrSignUp = loginOrSignUp;
