const express = require("express");
const Authrouter = express.Router();
const {register,login} = require('../controllers/userAuthenticate')


Authrouter.post('/register',register);
Authrouter.post('/login',login);
// Authrouter.post('/logout',logout);
// Authrouter.post("/getProfile", getProfile);

module.exports = Authrouter;
