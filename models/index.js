const mongoose    =    require('mongoose');
mongoose.set("debug" , true);
mongoose.Promise = Promise;
mongoose.connect(process.env.DATABASEURL , { 
    useNewUrlParser: true, 
    useCreateIndex : true,
    keepAlive : true 
});


module.exports.User = require("./User");
module.exports.Event = require("./Event");
module.exports.Society = require("./Society");
module.exports.Eventtaker = require("./Eventtaker");
module.exports.Guest = require("./Guest");
module.exports.Sponsor = require("./Sponsor");






