const jwt = require('jsonwebtoken')
const redisclient = require("../config/redis");
const User = require('../models/user');

const userMiddleware = async (req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error("Already Logout, No Token");
        }

        const payload = jwt.verify(token,process.env.JWT_KEY);

        const {_id} = payload;
        if(!_id){
            throw new Error("invalid Token");
        }

        const result = await User.findById(_id);
        if(!result){
            throw new Error("User Does not Exit");
        }

        const IsBlocked = await redisclient.exists(`token:${token}`);

        if(IsBlocked){
            throw new Error("Invalid Token");
        }

        req.result = result;

        next();
    }catch(err){
        res.status(401).send("Error: " +err.message);
    }
}

module.exports = userMiddleware;