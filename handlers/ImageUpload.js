const cloudinary = require('cloudinary');
const sharp      = require("sharp");
const sizeOf       = require("image-size");
const multer    = require("multer");



// cloudinary config
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});



// Multer file storage setup ==== 
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


const upload = multer({ storage: storage, fileFilter: imageFilter});



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



// ===============
// UPLOAD IMAGE TO CLOUDINARY.COM SENDING OBJECT..
const upload_get_url = (image) => {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(image , {exif : true} , (err, url) => {
        if (err) return reject(err);
        return resolve(url);
      });
    });
}
  
  
// Upload buffer image to cloudinary 
const uploadFromBuffer = (req) => {
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


let imageUpload = {
    upload,
    fileUpload,
    upload_get_url,
    uploadFromBuffer,
    getAngle
}



module.exports = imageUpload;

