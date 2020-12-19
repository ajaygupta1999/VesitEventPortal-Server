const express = require('express');
const router =  express.Router();
const { signup } = require("../handlers/Auth");

router.post("/signup/google" , signup);


module.exports = router;