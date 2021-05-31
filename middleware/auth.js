const jwt = require("jsonwebtoken");

exports.loginRequired = function (req , res, next){
    try{
        console.log("I am in login session");
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token , process.env.JWT_SECRET_TOKEN , function(err , decoded) {
            if(decoded){
                next();
            }else{
                return next({
                    status : 401,
                    message : err.message
                });
            }
        })
    }catch(err){
        console.log(err);
        return next({
            status : 401,
            message : err.message
        });
    }
}



exports.ensureCorrectUser = function(req , res , next){
    try{
        console.log("I am checking of Auth");
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token , process.env.JWT_SECRET_TOKEN , function(err , decoded){
            if(decoded && decoded.id === req.params.userid){
                return next();
            }else{
                return next({
                    status : 401,
                    message : "Unauthorized access of data. Please avoid doing this thing."
                })
            }
        });
    }catch(err){
        console.log(err.message);
        return next({
            status : 401,
            message : "Unauthorized access of data. Please avoid doing this thing."
        });
    }
}