const express = require("express");
const Authrouter = express.Router();
const {register,login,logout,adminRegister} = require('../controllers/userAuthenticate')
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

Authrouter.post('/register',register);
Authrouter.post('/login',login);
Authrouter.post("/logout",userMiddleware, logout);
Authrouter.post("/admin/register",adminMiddleware,adminRegister);


module.exports = Authrouter;
