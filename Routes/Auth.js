const express = require('express');
const router =  express.Router();
const { loginOrSignUp } = require("../handlers/Auth"); 

router.post("/loginOrSignUp/google" , loginOrSignUp);


module.exports = router;