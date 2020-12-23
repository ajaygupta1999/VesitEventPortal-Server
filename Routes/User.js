const express = require('express');
const router =  express.Router();
const multer    = require("multer");
const db      = require("../models");
const cloudinary = require('cloudinary');
const sharp      = require("sharp");
const sizeOf       = require("image-size");

const { loginRequired , ensureCorrectUser }  = require("../middleware/auth");
const Sponsor = require('../models/Sponsor');
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


router.post("/api/user/:id/create/personaldetails" , loginRequired , ensureCorrectUser , upload.single('image') , async function(req , res , next){
      try{
        const { firstname , lastname , phonenum } = req.body;
        let imgobj = {};
        if(req.file){
                if(req.file.size > 1000000){
                    let buffdata;
                    let dimensions = sizeOf(req.file.path);
                    await sharp(req.file.path)
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
                    var result = await upload_get_url(req.file.path);
                }
                var angle = getAngle(result.exif.Orientation);
                imgobj.dataurl = result.secure_url;
                imgobj.dataid = result.public_id;
                imgobj.angle =  angle;
        }
        
        let user = await db.User.findById(req.params.id);
        user.username = firstname + " " + lastname,
        user.firstname = firstname;
        user.lastname = lastname;
        user.phonenum = phonenum;
        user.imgurl = imgobj;
        await user.save();
        console.log(user);
        return res.json({
            username : user.username,
            firstname : user.firstname,
            lastname : user.lastname,
            imgurl : user.imgurl,
            id : user._id,
            email : user.email,
        });

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
      return res.json({
        classdetails : {
            department : user.classdetails.department,
            class : user.classdetails.class,
            rollno : user.classdetails.rollno,
            currentyearofstudy : user.classdetails.currentyearofstudy,
            semester : user.classdetails.semester
        },
        societydetails : {
            name : user.societydetails.name,
            role : user.societydetails.name
        }
      });

    }catch(err){
        return next({
              message : err.message
        });
    }
});


router.post("/api/user/:id/add/eventdetails" ,  loginRequired , ensureCorrectUser , upload.single('image') , async function(req , res , next){
    try{
      let imgobj = {};
      if(req.file){
              if(req.file.size > 1000000){
                  let buffdata;
                  let dimensions = sizeOf(req.file.path);
                  await sharp(req.file.path)
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
                  var result = await upload_get_url(req.file.path);
              }
              var angle = getAngle(result.exif.Orientation);
              imgobj.dataurl = result.secure_url;
              imgobj.dataid = result.public_id;
              imgobj.angle =  angle;
      }
      
      let user = await db.User.findById(req.params.id);
      let dbsociety = await db.Society.findOne({name : user.societydetails.name});
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

router.post("/api/user/:id/add/:eventid/guestandsponsor" ,  loginRequired , ensureCorrectUser , upload.single('image') , async function(req , res , next){
  try{
      let imgobj = {};
      if(req.body.issponsored === "true"){
            imgobj = await fileUpload(req.file);
      }
      
      let event = await db.Event.findById(req.params.eventid);
      let user = await db.User.findById(req.params.id);
      if(event.creator.toString() === user._id.toString()){
         // Event is Sponsored Or NoT ====
          if(req.body.issponsored === "true"){
               let dbsponsor = await Sponsor.create({
                    sponsorname : req.body.sponsorsname,
                    imgurl:  imgobj,
                    description :  req.body.sponsorsdetails
               });
               dbsponsor.inevent.push(event._id);
               event.sponsor.push(dbsponsor._id);
               await event.save();
               await dbsponsor.save();
          }  
          // IF guest is comming from outside ====> Guest
          if(req.body.isguest === "true"){
              let guest = await db.Guest.create({
                  name : req.body.name,
                  profession : req.body.profession,
                  description : req.body.description,
              });
              guest.inevent.push(event._id);
              await guest.save();
              event.guest.push(guest._id);
          }
          // Eventtaker ===> Outside Guest
          if(req.body.eventtakertype === "outsideguest"){
                let outsideguest = await db.Eventtaker.create({
                    role : "guest",
                    details : {
                      guest : {
                        name : req.body.guestname,
                        profession : req.body.guestprofession,
                        description : req.body.guestdesc
                      }
                    } 
                });
                outsideguest.inevent.push(event._id);
                await outsideguest.save();
                let unreg_data = {
                    role : "guest",
                    takers : [outsideguest._id]
                }
                event.eventtaker.unregistered_eventtaker.push(unreg_data);
                await event.save();
          }
          // EventTaker ====> Faculty
          if(req.body.eventtakertype === "collegefaculty"){
                let faculty = await db.Eventtaker.create({
                  role : "faculty",
                  details : {
                    faculty : {
                        name : req.body.facultyname,
                        description : req.body.facultydesc
                    }
                  }
                });
                faculty.inevent.push(event._id);
                await faculty.save();
                let facu_data = {
                    role : "faculty",
                    takers : [faculty._id]
                }
                event.eventtaker.unregistered_eventtaker.push(facu_data);
                await event.save();
          }
          // Event taker ====> Others  
          if(req.body.eventtakertype === "others"){
                let dbother = await db.Eventtaker.create({
                  role : "others",
                  details : {
                    others : {
                        name : req.body.othersname,
                        branch : req.body.othersdepartment,
                        currentyear : Number(req.body.otherscurrentyear),
                        class : req.body.othersclass
                    }
                  }
                });
                dbother.inevent.push(event._id);
                await dbother.save();
                let others_data = {
                    role : "others",
                    takers : [dbother._id]
                }
                event.eventtaker.unregistered_eventtaker.push(others_data);
                await event.save();
          }

          let belongingsociety = await db.Society.findById(event.society);
          belongingsociety.events.push(event._id);
          belongingsociety.save();

          return res.json(event);

      }

       return res.json({
            event
        });
      
    }catch(err){
         return next(err);
    }


    
    
});



async function fileUpload(file){
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