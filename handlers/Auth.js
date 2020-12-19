const db = require("../models");
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Signup function
async function signup(req , res, next) {
    try{
          // If user have already account then signin
          let userdata;
          const { tokenId } = req.body;
          let resdata = await client.verifyIdToken({
              idToken : tokenId,
              audience : process.env.GOOGLE_CLIENT_ID
          });
          // Handle err;
          const { email_verified , name , picture , email} = resdata.payload;
          if(email_verified){
              let user = await db.User.findOne({email});
              if(user){
                 // User exist
                 // Create jwt token
                 let token = jwt.sign({
                     id : user._id,
                     username : user.username,
                     imgurl : user.imgurl,
                     email : user.email
                 } , process.env.JWT_SECRET_TOKEN);

                 return res.json({
                            id : user._id,
                            username : user.username,
                            imgurl : user.imgurl,
                            email : user.email,
                            token
                });  
              }
                // Create new user
                // Create jwt token 
               let newuser = await db.User.create({
                    username : name,
                    imgurl : picture,
                    email : email
                });
        
                let token = jwt.sign({
                    id : newuser._id,
                    username : newuser.username,
                    imgurl : newuser.imgurl,
                    email : newuser.email
                } , process.env.JWT_SECRET_TOKEN);
                        
                return res.json({
                    id : newuser._id,
                    username : newuser.username,
                    imgurl : newuser.imgurl,
                    email : newuser.email,
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

module.exports.signup = signup;