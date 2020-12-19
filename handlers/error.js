function errorHandler(err , req , res , next){
    return res.status(err.status || 500).json({
        error : {
            message : err.message || "Opps! Something went wrong."
        }
    });
}


module.exports = errorHandler;
